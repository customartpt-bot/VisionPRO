
export type UserRole = 'admin' | 'analista' | 'dashboard' | 'analistacol' | 'analistaind';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  my_team_side: 'home' | 'away'; 
  date: string;
  time: string;
  location: string;
  competition: string;
  youtube_url: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'finished';
  current_game_seconds?: number; 
  current_half?: number; 
  half_split_seconds?: number; // O segundo em que a 2ª parte começou
  possession_home?: number; 
  possession_away?: number; 
  is_timer_running?: boolean;
  created_at?: string;
}

export interface Player {
  id: string;
  match_id: string;
  name: string;
  number: number;
  team: 'home' | 'away'; 
  is_starter: boolean; 
}

export interface MatchEvent {
  id: string;
  match_id: string;
  type: EventType;
  player_id?: string | null; 
  team: 'home' | 'away';
  video_timestamp: number; 
  match_minute: number; 
  game_seconds?: number; 
  half: number;
  created_at?: string;
  player?: Player; 
}

export type EventType = 
  | 'golo' 
  | 'assistência'
  | 'passe_certo' 
  | 'passe_errado' 
  | 'remate_alvo' 
  | 'remate_fora' 
  | 'falta_cometida' 
  | 'falta_sofrida' 
  | 'amarelo' 
  | 'vermelho' 
  | 'canto' 
  | 'fora-de-jogo' 
  | 'perda_bola' 
  | 'recuperação_bola'
  | 'sub_entra'    
  | 'sub_sai'   
  | 'posse_update'; 

export interface PossessionStats {
  homeTime: number; 
  awayTime: number; 
}
