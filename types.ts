
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
  date: string;
  time: string;
  location: string;
  competition: string;
  youtube_url: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'finished';
  current_game_seconds?: number; // Novo campo para persistência do tempo
  created_at?: string;
}

export interface Player {
  id: string;
  match_id: string;
  name: string;
  number: number;
  team: 'home' | 'away'; // 'home' or 'away'
  is_starter: boolean;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  type: EventType;
  player_id?: string | null; // Null for collective events
  team: 'home' | 'away';
  video_timestamp: number; // Seconds in video
  match_minute: number; // Minute in game logic
  game_seconds?: number; // Exact second of the game clock when event occurred
  created_at?: string;
  player?: Player; // Joined data
}

export type EventType = 
  | 'goal' 
  | 'pass_success' 
  | 'pass_fail' 
  | 'shot_on_target' 
  | 'shot_off_target' 
  | 'foul_committed' 
  | 'foul_won' 
  | 'yellow_card' 
  | 'red_card' 
  | 'corner' 
  | 'offside' 
  | 'ball_loss' 
  | 'ball_recovery'
  | 'possession_update'; // Special type for periodic updates

export interface PossessionStats {
  homeTime: number; // Seconds
  awayTime: number; // Seconds
}
