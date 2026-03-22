import { GameId } from '../types';

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  iconFamily: string;
  category: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'trois-pions',
    name: '3 Pions',
    description: 'Senegalese alignment strategy game. Place and move your 3 pieces to align them.',
    icon: 'circle-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic X and O game. Be the first to align 3 in a row.',
    icon: 'close',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Classic',
  },
  {
    id: 'checkers',
    name: 'Checkers',
    description: "Capture all your opponent's pieces by jumping over them.",
    icon: 'checkerboard',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'The ultimate strategy game. Checkmate your opponent\'s king.',
    icon: 'chess-king',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
];

export const getGameMeta = (gameId: GameId): GameMeta | undefined => {
  return GAMES.find(game => game.id === gameId);
};
