
import { neon } from '@neondatabase/serverless';
import { AnalysisData } from '../types';

const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("DATABASE_URL não configurado no ambiente. Modo offline ativo.");
    return null;
  }
  return neon(url);
};

export const dbService = {
  isConfigured(): boolean {
    return !!process.env.DATABASE_URL;
  },

  async saveAnalysis(data: AnalysisData, userId: string, videoName: string = 'Game Analysis') {
    const sql = getSql();
    if (!sql) return;

    try {
      await sql`
        INSERT INTO analyses (
          home_team_name, 
          away_team_name, 
          video_filename, 
          analysis_data, 
          user_id
        ) VALUES (
          ${data.homeTeam.name}, 
          ${data.awayTeam.name}, 
          ${videoName}, 
          ${JSON.stringify(data)}, 
          ${userId}
        )
      `;
    } catch (error) {
      console.error("Erro na persistência Cloud:", error);
    }
  },

  async fetchAnalyses(): Promise<AnalysisData[]> {
    const sql = getSql();
    if (!sql) return [];
    try {
      const results = await sql`SELECT analysis_data FROM analyses ORDER BY created_at DESC LIMIT 50`;
      return results.map(row => row.analysis_data as AnalysisData);
    } catch (error) {
      return [];
    }
  },

  async searchAnalyses(query: string): Promise<AnalysisData[]> {
    const sql = getSql();
    if (!sql) return this.fetchAnalyses();
    try {
      const q = `%${query}%`;
      const results = await sql`
        SELECT analysis_data FROM analyses 
        WHERE home_team_name ILIKE ${q} 
           OR away_team_name ILIKE ${q}
        ORDER BY created_at DESC
      `;
      return results.map(row => row.analysis_data as AnalysisData);
    } catch (error) {
      return [];
    }
  }
};
