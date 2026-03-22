import { create } from 'zustand';
import { GameStore, GameConfig, Player } from '../types';

export const useGameStore = create<GameStore>((set) => ({
  config: null,
  players: {
    1: { id: 1, name: 'Player 1', score: 0 },
    2: { id: 2, name: 'Player 2', score: 0 },
  },
  setConfig: (config: GameConfig) => set({ config }),
  setPlayerName: (player: Player, name: string) =>
    set((state) => ({
      players: {
        ...state.players,
        [player]: { ...state.players[player], name },
      },
    })),
  resetPlayers: () =>
    set({
      players: {
        1: { id: 1, name: 'Player 1', score: 0 },
        2: { id: 2, name: 'Player 2', score: 0 },
      },
    }),
}));
