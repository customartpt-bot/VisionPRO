
import { neon } from '@neondatabase/serverless';
import { AnalysisData } from '../types';

/**
 * Retorna o cliente SQL do Neon apenas quando necessário.
 * Isso evita falhas fatais durante o carregamento do módulo caso a DATABASE_URL não esteja definida.
 */
const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  return neon(url);
};

export const dbService = {
  /**
   * Guarda uma nova análise na base de dados Neon.
   */
  async saveAnalysis(data: AnalysisData, userId: string, videoName: string = 'N/A') {
    const sql = getSql();
    if (!sql) {
      console.warn("VisionPRO: DATABASE_URL não configurada. A saltar persistência no Neon.");
      return;
    }

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
      console.error("Erro ao guardar no Neon:", error);
      throw error;
    }
  },

  /**
   * Procura as últimas análises do utilizador ou globais.
   */
  async fetchAnalyses(userId?: string): Promise<AnalysisData[]> {
    const sql = getSql();
    if (!sql) {
      console.warn("VisionPRO: DATABASE_URL não configurada. O histórico não poderá ser carregado.");
      return [];
    }

    try {
      const results = await sql`
        SELECT analysis_data 
        FROM analyses 
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      
      return results.map(row => row.analysis_data as AnalysisData);
    } catch (error) {
      console.error("Erro ao procurar dados no Neon:", error);
      return [];
    }
  }
};
