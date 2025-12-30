
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ManualMatchAnalysis, MatchEvent, UserRole, AnalysisData, PlayerStats, TeamStats, Highlight } from '../types';

const supabaseUrl = 'https://qabwchsqgdtkfgcfxbzo.supabase.co';
// Obtemos a chave mas não permitimos que seja uma string vazia no createClient para evitar o erro fatal
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || null;

// Inicialização segura: só criamos o cliente se tivermos URL e Key
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Chave para o fallback em localStorage
const LOCAL_STORAGE_KEY = 'visionpro_local_matches';

// Chave para análises de IA no LocalStorage (fallback)
const LOCAL_STORAGE_AI_KEY = 'visionpro_local_ai_analyses';


export const dbService = {
  isCloudEnabled(): boolean {
    return !!supabase;
  },

  async getUserRole(userId: string): Promise<UserRole> {
    if (!supabase) return 'analista'; // Default para modo local
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) return 'analista';
      return data.role as UserRole;
    } catch {
      return 'analista';
    }
  },

  async saveMatch(match: ManualMatchAnalysis) {
    if (!supabase) {
      // Fallback para LocalStorage
      const localMatches = this._getLocalMatches();
      const id = match.id || `local_${Date.now()}`;
      const updatedMatch = { ...match, id };
      
      const index = localMatches.findIndex(m => m.id === id);
      if (index >= 0) {
        localMatches[index] = updatedMatch;
      } else {
        localMatches.push(updatedMatch);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localMatches));
      return updatedMatch;
    }

    const { data, error } = await supabase
      .from('matches')
      .upsert({
        id: match.id || undefined,
        video_source: match.videoSource,
        match_date: match.date,
        match_time: match.time,
        location: match.location,
        home_team_name: match.homeTeam.name,
        away_team_name: match.awayTeam.name,
        home_lineup: match.homeTeam.lineup,
        away_lineup: match.awayTeam.lineup,
        possession_home: match.possessionTimeHome,
        possession_away: match.possessionTimeAway
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addEvent(event: Omit<MatchEvent, 'id'>, matchId: string) {
    if (!supabase) {
      const localMatches = this._getLocalMatches();
      const matchIndex = localMatches.findIndex(m => m.id === matchId);
      
      if (matchIndex >= 0) {
        const newEvent = { ...event, id: `evt_${Date.now()}_${Math.random()}` };
        localMatches[matchIndex].events.push(newEvent as MatchEvent);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localMatches));
      }
      return { status: 'saved_locally' };
    }

    const { data, error } = await supabase
      .from('match_events')
      .insert({
        match_id: matchId,
        type: event.type,
        team: event.team,
        player_number: event.playerNumber,
        player_name: event.playerName,
        timestamp_video: event.timestamp,
        description: event.description,
        analyst_role: event.analystRole
      });

    if (error) throw error;
    return data;
  },

  async fetchMatches(): Promise<ManualMatchAnalysis[]> {
    const localMatches = this._getLocalMatches();
    
    if (!supabase) {
      return localMatches;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_events (*)
        `)
        .order('created_at', { ascending: false });

      if (error) return localMatches;

      const cloudMatches = data.map(m => ({
        id: m.id,
        videoSource: m.video_source,
        date: m.match_date,
        time: m.match_time,
        location: m.location,
        homeTeam: { name: m.home_team_name, lineup: m.home_lineup },
        awayTeam: { name: m.away_team_name, lineup: m.away_lineup },
        events: (m.match_events || []).map((e: any) => ({
          id: e.id,
          type: e.type,
          team: e.team,
          playerNumber: e.player_number,
          playerName: e.player_name,
          timestamp: e.timestamp_video,
          description: e.description,
          analystRole: e.analyst_role
        })),
        possessionTimeHome: m.possession_home || 0,
        possessionTimeAway: m.possession_away || 0
      }));

      // Unimos local e cloud, removendo duplicados por ID (cloud tem prioridade)
      const combined = [...cloudMatches];
      localMatches.forEach(lm => {
        if (!combined.some(cm => cm.id === lm.id)) {
          combined.push(lm);
        }
      });

      return combined;
    } catch {
      return localMatches;
    }
  },

  async deleteMatch(id: string) {
    // Remove do LocalStorage sempre que houver tentativa de delete
    const localMatches = this._getLocalMatches();
    const filtered = localMatches.filter(m => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

    if (!supabase || id.startsWith('local_')) return;

    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) throw error;
  },

  async saveAIAnalysis(analysis: AnalysisData): Promise<AnalysisData> {
    if (!supabase) {
      // Fallback para LocalStorage
      const localAIAnalyses = this._getLocalAIAnalyses();
      const id = analysis.id || `ai_local_${Date.now()}`;
      const updatedAnalysis = { ...analysis, id };
      
      localAIAnalyses.push(updatedAnalysis);
      localStorage.setItem(LOCAL_STORAGE_AI_KEY, JSON.stringify(localAIAnalyses));
      return updatedAnalysis;
    }

    // Inserir na tabela principal 'analyses' para obter o analysis_id
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        home_team_name: analysis.homeTeam.name,
        away_team_name: analysis.awayTeam.name,
        analysis_date: new Date().toISOString().split('T')[0], // Data atual da análise
      })
      .select('id')
      .single();

    if (analysisError) throw analysisError;
    const analysisId = analysisData.id;

    // Inserir estatísticas da equipe
    const teamStatsToInsert = [
      { ...analysis.homeTeam.stats, analysis_id: analysisId, team_name: analysis.homeTeam.name, is_home_team: true },
      { ...analysis.awayTeam.stats, analysis_id: analysisId, team_name: analysis.awayTeam.name, is_home_team: false },
    ];
    const { error: teamStatsError } = await supabase.from('ai_team_stats').insert(teamStatsToInsert.map(s => ({
      analysis_id: s.analysis_id,
      team_name: s.team_name,
      is_home_team: s.is_home_team,
      possession: s.possession,
      passes_total: s.passesTotal,
      passes_completed: s.passesCompleted,
      shots_total: s.shotsTotal,
      shots_on_target: s.shotsOnTarget,
      corners: s.corners,
      fouls: s.fouls,
      yellow_cards: s.yellowCards,
      red_cards: s.redCards,
    })));
    if (teamStatsError) throw teamStatsError;

    // Inserir estatísticas dos jogadores
    const allPlayersToInsert = [
      ...analysis.homeTeam.players.map(p => ({ ...p, team_name: analysis.homeTeam.name, analysis_id: analysisId })),
      ...analysis.awayTeam.players.map(p => ({ ...p, team_name: analysis.awayTeam.name, analysis_id: analysisId })),
    ];
    const { error: playerStatsError } = await supabase.from('ai_player_stats').insert(allPlayersToInsert.map(p => ({
      analysis_id: p.analysis_id,
      team_name: p.team_name,
      player_name: p.name,
      player_number: p.number,
      position: p.position,
      distance_covered: p.distanceCovered,
      top_speed: p.topSpeed,
      passes: p.passes,
      pass_accuracy: p.passAccuracy,
      shots: p.shots,
      rating: p.rating,
    })));
    if (playerStatsError) throw playerStatsError;

    // Inserir destaques
    const highlightsToInsert = analysis.highlights.map(h => ({
      analysis_id: analysisId,
      timestamp_text: h.timestamp,
      description: h.description,
      event_type: h.type,
    }));
    const { error: highlightsError } = await supabase.from('ai_highlights').insert(highlightsToInsert);
    if (highlightsError) throw highlightsError;

    return { ...analysis, id: analysisId };
  },

  async fetchAIAnalyses(): Promise<AnalysisData[]> {
    const localAIAnalyses = this._getLocalAIAnalyses();

    if (!supabase) {
      return localAIAnalyses;
    }

    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          home_team_name,
          away_team_name,
          analysis_date,
          ai_team_stats (*),
          ai_player_stats (*),
          ai_highlights (*)
        `)
        .order('created_at', { ascending: false });

      if (error) return localAIAnalyses;

      const cloudAIAnalyses: AnalysisData[] = data.map((a: any) => {
        const homeTeamStats = a.ai_team_stats.find((ts: any) => ts.is_home_team);
        const awayTeamStats = a.ai_team_stats.find((ts: any) => !ts.is_home_team);

        return {
          id: a.id,
          homeTeam: {
            name: a.home_team_name,
            stats: {
              possession: homeTeamStats?.possession || 0,
              passesTotal: homeTeamStats?.passes_total || 0,
              passesCompleted: homeTeamStats?.passes_completed || 0,
              shotsTotal: homeTeamStats?.shots_total || 0,
              shotsOnTarget: homeTeamStats?.shots_on_target || 0,
              corners: homeTeamStats?.corners || 0,
              fouls: homeTeamStats?.fouls || 0,
              yellowCards: homeTeamStats?.yellow_cards || 0,
              redCards: homeTeamStats?.red_cards || 0,
            } as TeamStats,
            players: a.ai_player_stats
              .filter((p: any) => p.team_name === a.home_team_name)
              .map((p: any) => ({
                id: p.id, // Usar o ID do BD para o PlayerStats, se disponível, ou um gerado
                name: p.player_name,
                number: p.player_number,
                position: p.position,
                distanceCovered: p.distance_covered,
                topSpeed: p.top_speed,
                passes: p.passes,
                passAccuracy: p.pass_accuracy,
                shots: p.shots,
                rating: p.rating,
              })) as PlayerStats[],
          },
          awayTeam: {
            name: a.away_team_name,
            stats: {
              possession: awayTeamStats?.possession || 0,
              passesTotal: awayTeamStats?.passes_total || 0,
              passesCompleted: awayTeamStats?.passes_completed || 0,
              shotsTotal: awayTeamStats?.shots_total || 0,
              shotsOnTarget: awayTeamStats?.shots_on_target || 0,
              corners: awayTeamStats?.corners || 0,
              fouls: awayTeamStats?.fouls || 0,
              yellowCards: awayTeamStats?.yellow_cards || 0,
              redCards: awayTeamStats?.red_cards || 0,
            } as TeamStats,
            players: a.ai_player_stats
              .filter((p: any) => p.team_name === a.away_team_name)
              .map((p: any) => ({
                id: p.id,
                name: p.player_name,
                number: p.player_number,
                position: p.position,
                distanceCovered: p.distance_covered,
                topSpeed: p.top_speed,
                passes: p.passes,
                passAccuracy: p.pass_accuracy,
                shots: p.shots,
                rating: p.rating,
              })) as PlayerStats[],
          },
          highlights: a.ai_highlights.map((h: any) => ({
            timestamp: h.timestamp_text,
            description: h.description,
            type: h.event_type,
          })) as Highlight[],
        };
      });

      // Unir local e cloud, cloud tem prioridade
      const combined = [...cloudAIAnalyses];
      localAIAnalyses.forEach(lm => {
        if (!combined.some(cm => cm.id === lm.id)) {
          combined.push(lm);
        }
      });

      return combined;
    } catch (err) {
      console.error("Erro ao buscar análises de IA:", err);
      return localAIAnalyses;
    }
  },

  async deleteAIAnalysis(id: string) {
    // Remove do LocalStorage sempre que houver tentativa de delete
    const localAIAnalyses = this._getLocalAIAnalyses();
    const filtered = localAIAnalyses.filter(m => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_AI_KEY, JSON.stringify(filtered));

    if (!supabase || id.startsWith('ai_local_')) return;

    // O onDelete Cascade nas tabelas filhas cuidará da exclusão
    const { error } = await supabase.from('analyses').delete().eq('id', id);
    if (error) throw error;
  },

  async searchAnalyses(query: string): Promise<AnalysisData[]> {
    if (!supabase) {
      return this._getLocalAIAnalyses().filter(a => 
        a.homeTeam.name.toLowerCase().includes(query.toLowerCase()) ||
        a.awayTeam.name.toLowerCase().includes(query.toLowerCase()) ||
        a.homeTeam.players.some(p => p.name.toLowerCase().includes(query.toLowerCase())) ||
        a.awayTeam.players.some(p => p.name.toLowerCase().includes(query.toLowerCase()))
      );
    }

    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          home_team_name,
          away_team_name,
          analysis_date,
          ai_team_stats (*),
          ai_player_stats (player_name, team_name, rating, pass_accuracy, distance_covered, top_speed, number, position, shots, passes)
        `)
        .or(`home_team_name.ilike.%${query}%,away_team_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Filtrar players se a query se aplicar a eles
      const filteredData = data.filter((analysis: any) => {
        const teamMatch = analysis.home_team_name.toLowerCase().includes(query.toLowerCase()) ||
                          analysis.away_team_name.toLowerCase().includes(query.toLowerCase());
        const playerMatch = analysis.ai_player_stats.some((p: any) => 
                              p.player_name.toLowerCase().includes(query.toLowerCase()));
        return teamMatch || playerMatch;
      });

      return filteredData.map((a: any) => {
        const homeTeamStats = a.ai_team_stats.find((ts: any) => ts.is_home_team);
        const awayTeamStats = a.ai_team_stats.find((ts: any) => !ts.is_home_team);

        return {
          id: a.id,
          homeTeam: {
            name: a.home_team_name,
            stats: homeTeamStats,
            players: a.ai_player_stats.filter((p: any) => p.team_name === a.home_team_name).map((p: any) => ({
              id: p.id,
              name: p.player_name,
              number: p.player_number,
              position: p.position,
              distanceCovered: p.distance_covered,
              topSpeed: p.top_speed,
              passes: p.passes,
              passAccuracy: p.pass_accuracy,
              shots: p.shots,
              rating: p.rating,
            })),
          },
          awayTeam: {
            name: a.away_team_name,
            stats: awayTeamStats,
            players: a.ai_player_stats.filter((p: any) => p.team_name === a.away_team_name).map((p: any) => ({
              id: p.id,
              name: p.player_name,
              number: p.player_number,
              position: p.position,
              distanceCovered: p.distance_covered,
              topSpeed: p.top_speed,
              passes: p.passes,
              passAccuracy: p.pass_accuracy,
              shots: p.shots,
              rating: p.rating,
            })),
          },
          highlights: [], // Destaques não são necessários para a pesquisa aqui, ou podem ser buscados separadamente se a query for mais profunda
        };
      });

    } catch (err) {
      console.error("Erro na pesquisa de análises:", err);
      return [];
    }
  },

  subscribeToMatch(matchId: string, onEvent: (event: MatchEvent) => void) {
    if (!supabase || matchId.startsWith('local_')) {
      return { unsubscribe: () => {} };
    }

    return supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const e = payload.new;
          onEvent({
            id: e.id,
            type: e.type,
            team: e.team,
            playerNumber: e.player_number,
            playerName: e.player_name,
            timestamp: e.timestamp_video,
            description: e.description,
            analystRole: e.analyst_role
          });
        }
      )
      .subscribe();
  },

  _getLocalMatches(): ManualMatchAnalysis[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  _getLocalAIAnalyses(): AnalysisData[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_AI_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Erro ao carregar análises de IA locais:", e);
      return [];
    }
  }
};
