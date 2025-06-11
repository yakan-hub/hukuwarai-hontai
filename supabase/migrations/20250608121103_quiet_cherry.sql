/*
  # FUKUWARAI Online Database Schema
  
  1. New Tables
    - `rooms` - Game room management with status and current turn tracking
    - `players` - Player information and turn order within rooms
    - `placements` - Face part placements with position and transformation data
    - `templates` - Face outline templates for selection
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their game data
    - Allow read access to templates for all authenticated users
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'waiting',
  current_turn_player_id uuid,
  template_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create players table  
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Player',
  turn_order int NOT NULL,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  part_type text NOT NULL,
  part_id text NOT NULL,
  x float NOT NULL DEFAULT 0,
  y float NOT NULL DEFAULT 0,
  scale float NOT NULL DEFAULT 1,
  rotation float NOT NULL DEFAULT 0,
  placed_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default templates
INSERT INTO templates (name, image_url) VALUES
  ('Classic Round', '/templates/template1.png'),
  ('Oval Face', '/templates/template2.png'), 
  ('Square Jaw', '/templates/template3.png'),
  ('Heart Shape', '/templates/template4.png'),
  ('Long Face', '/templates/template5.png'),
  ('Wide Face', '/templates/template6.png')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can read rooms they're part of"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM players 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update rooms they're part of"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM players 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for players
CREATE POLICY "Users can read players in their rooms"
  ON players FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM players 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create player records"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own player records"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for placements
CREATE POLICY "Users can read placements in their rooms"
  ON placements FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM players 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create placements in their rooms"
  ON placements FOR INSERT
  TO authenticated
  WITH CHECK (
    room_id IN (
      SELECT room_id FROM players 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for templates  
CREATE POLICY "Anyone can read templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);