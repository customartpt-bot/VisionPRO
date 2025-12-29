
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

export interface PlayerStats {
  id: string;
  name: string;
  number: number;
  position: string;
  distanceCovered: number; // km
  topSpeed: number; // km/h
  passes: number;
  passAccuracy: number;
  shots: number;
  rating: number;
}

export interface AnalysisData {
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
  highlights: {
    timestamp: string;
    description: string;
    type: 'goal' | 'card' | 'shot' | 'tactical';
  }[];
}

export interface MatchInfo {
  id: string;
  date: string;
  competition: string;
  homeTeamName: string;
  awayTeamName: string;
  score: string;
}
