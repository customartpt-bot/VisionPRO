
export type ActionType = 
  | 'pass_certo' 
  | 'pass_errado' 
  | 'remate_certo' 
  | 'remate_fora' 
  | 'falta_cometida' 
  | 'falta_sofrida' 
  | 'perda_posse' 
  | 'recuperacao' 
  | 'goal' 
  | 'interception'
  | 'corner'
  | 'yellow_card'
  | 'red_card'
  | 'substituicao';

export type AnalystRole = 'collective' | 'individual' | 'lead';

// Added UserRole type export to resolve module errors in App.tsx and dbService.ts
export type UserRole = 'analista' | 'jogo' | 'admin';

export interface MatchEvent {
  id: string;
  type: ActionType;
  team: 'home' | 'away';
  playerNumber?: number;
  playerName?: string;
  timestamp: number;
  description: string;
  analystRole: AnalystRole;
}

export interface PlayerLineup {
  number: number;
  name: string;
  position: string;
  isStarter: boolean;
}

export interface ManualMatchAnalysis {
  id: string;
  videoSource: string;
  date: string;
  time: string;
  location: string;
  homeTeam: {
    name: string;
    lineup: PlayerLineup[];
  };
  awayTeam: {
    name: string;
    lineup: PlayerLineup[];
  };
  events: MatchEvent[];
  possessionTimeHome: number;
  possessionTimeAway: number;
}

/**
 * Added PlayerStats interface to represent automated performance metrics for a single player.
 */
export interface PlayerStats {
  id: string;
  name: string;
  number: number;
  position: string;
  distanceCovered: number;
  topSpeed: number;
  passes: number;
  passAccuracy: number;
  shots: number;
  rating: number;
}

/**
 * Added TeamStats interface to represent overall tactical metrics for a team.
 */
export interface TeamStats {
  possession: number;
  passesTotal: number;
  passesCompleted: number;
  shotsTotal: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

/**
 * Added Highlight interface for key match moments.
 */
export interface Highlight {
  timestamp: string;
  description: string;
  type: string;
}

export interface AnalysisData {
  id?: string; // Adicionado para armazenar o ID do banco de dados
  homeTeam: {
    name: string;
    stats: TeamStats;
    players: PlayerStats[];
  };
  awayTeam: {
    name: string;
    stats: TeamStats;
    players: PlayerStats[];
  };
  highlights: Highlight[];
}
