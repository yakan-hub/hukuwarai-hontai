import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Room {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  current_turn_player_id: string | null;
  template_id: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  display_name: string;
  turn_order: number;
  user_id: string | null;
  created_at: string;
}

export interface Placement {
  id: string;
  room_id: string;
  player_id: string;
  part_type: string;
  part_id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  placed_at: string;
}

export interface Template {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}