
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ManualMatchAnalysis, MatchEvent, UserRole, AnalysisData } from '../types';

const supabaseUrl = 'https://qabwchsqgdtkfgcfxbzo.supabase.co';
// Obtemos a chave mas não permitimos que seja uma string vazia no createClient para evitar o erro fatal
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || null;

// Inicialização segura: só criamos o cliente se tivermos URL e Key
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Chave para o fallback em localStorage
const LOCAL_STORAGE_KEY = 'visionpro_local_matches';

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

  async searchAnalyses(query: string): Promise<AnalysisData[]> {
    console.debug('Searching analyses with query:', query);
    return [];
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
  }
};
