
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
  created_at?: string;
  player?: Player; 
}

export type EventType = 
  | 'goal' 
  | 'assist'
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
  | 'sub_in'    
  | 'sub_out'   
  | 'possession_update'; 

export interface PossessionStats {
  homeTime: number; 
  awayTime: number; 
}
