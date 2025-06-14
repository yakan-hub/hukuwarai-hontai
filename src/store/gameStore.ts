import { create } from 'zustand';
import { supabase, Room, Player, Placement, Template, Profile } from '../lib/supabase';

export interface GameState {
  // Current game state
  currentRoom: Room | null;
  currentPlayer: Player | null;
  currentProfile: Profile | null;
  players: Player[];
  placements: Placement[];
  templates: Template[];
  
  // UI state
  selectedTemplate: Template | null;
  selectedPart: { type: string; id: string; src: string } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedTemplate: (template: Template) => void;
  setSelectedPart: (part: { type: string; id: string; src: string } | null) => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadProfile: () => Promise<void>;
  subscribeToPlacements: (roomId: string) => () => void;
  addPlacement: (placement: Omit<Placement, 'id' | 'placed_at'>) => Promise<void>;
  nextTurn: () => Promise<void>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentRoom: null,
  currentPlayer: null,
  currentProfile: null,
  players: [],
  placements: [],
  templates: [],
  selectedTemplate: null,
  selectedPart: null,
  isLoading: false,
  error: null,

  // Actions
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  setSelectedPart: (part) => set({ selectedPart: part }),

  loadProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ currentProfile: profile });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  },

  createRoom: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Sign in anonymously if not authenticated
        const { data: authData } = await supabase.auth.signInAnonymously();
        if (!authData.user) throw new Error('Failed to authenticate');
      }

      // Load profile if authenticated
      await get().loadProfile();

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ status: 'waiting' })
        .select()
        .single();

      if (roomError) throw roomError;

      // Get current user again (might have changed)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not found');

      // Get nickname from profile or use default
      const { currentProfile } = get();
      const displayName = currentProfile?.nickname || `Player 1`;

      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          display_name: displayName,
          turn_order: 1,
          user_id: currentUser.id
        })
        .select()
        .single();

      if (playerError) throw playerError;

      set({ 
        currentRoom: room, 
        currentPlayer: player,
        players: [player],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create room',
        isLoading: false 
      });
    }
  },

  joinRoom: async (roomId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Sign in anonymously if not authenticated
        const { data: authData } = await supabase.auth.signInAnonymously();
        if (!authData.user) throw new Error('Failed to authenticate');
      }

      // Load profile if authenticated
      await get().loadProfile();

      // Get room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // Get existing players to determine turn order
      const { data: existingPlayers } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomId)
        .order('turn_order');

      const nextTurnOrder = (existingPlayers?.length || 0) + 1;

      // Get current user again (might have changed)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not found');

      // Get nickname from profile or use default
      const { currentProfile } = get();
      const displayName = currentProfile?.nickname || `Player ${nextTurnOrder}`;

      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomId,
          display_name: displayName,
          turn_order: nextTurnOrder,
          user_id: currentUser.id
        })
        .select()
        .single();

      if (playerError) throw playerError;

      set({ 
        currentRoom: room, 
        currentPlayer: player,
        players: [...(existingPlayers || []), player],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join room',
        isLoading: false 
      });
    }
  },

  loadTemplates: async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at');

      if (error) throw error;
      set({ templates: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load templates' });
    }
  },

  subscribeToPlacements: (roomId) => {
    const subscription = supabase
      .channel(`placements:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'placements',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        const { placements } = get();
        if (payload.eventType === 'INSERT') {
          set({ placements: [...placements, payload.new as Placement] });
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  },

  addPlacement: async (placement) => {
    try {
      const { error } = await supabase
        .from('placements')
        .insert(placement);

      if (error) throw error;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add placement' });
    }
  },

  nextTurn: async () => {
    const { currentRoom, players } = get();
    if (!currentRoom) return;

    try {
      const currentPlayerIndex = players.findIndex(p => p.id === currentRoom.current_turn_player_id);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      const nextPlayer = players[nextPlayerIndex];

      const { error } = await supabase
        .from('rooms')
        .update({ current_turn_player_id: nextPlayer.id })
        .eq('id', currentRoom.id);

      if (error) throw error;

      set({ currentRoom: { ...currentRoom, current_turn_player_id: nextPlayer.id } });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to advance turn' });
    }
  },

  setError: (error) => set({ error }),

  reset: () => set({
    currentRoom: null,
    currentPlayer: null,
    players: [],
    placements: [],
    selectedTemplate: null,
    selectedPart: null,
    error: null
  })
}));