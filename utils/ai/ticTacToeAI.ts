import { Player, Difficulty, TicTacToeBoardState } from '../../types';
import { checkTTTWin, checkTTTDraw, getEmptyPositions, TTT_WIN_LINES } from '../gameHelpers';

// Easy: Random move
export function getEasyMove(board: TicTacToeBoardState): number {
  const emptyPositions = getEmptyPositions(board);
  if (emptyPositions.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  return emptyPositions[randomIndex];
}

// Medium: Heuristic-based
export function getMediumMove(
  board: TicTacToeBoardState,
  aiPlayer: Player
): number {
  const humanPlayer: Player = aiPlayer === 1 ? 2 : 1;
  const emptyPositions = getEmptyPositions(board);

  // 1. Win if possible
  for (const pos of emptyPositions) {
    const testBoard = [...board] as TicTacToeBoardState;
    testBoard[pos] = aiPlayer;
    if (checkTTTWin(testBoard, aiPlayer)) {
      return pos;
    }
  }

  // 2. Block opponent win
  for (const pos of emptyPositions) {
    const testBoard = [...board] as TicTacToeBoardState;
    testBoard[pos] = humanPlayer;
    if (checkTTTWin(testBoard, humanPlayer)) {
      return pos;
    }
  }

  // 3. Take center
  if (board[4] === null) {
    return 4;
  }

  // 4. Take a corner
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter((c) => board[c] === null);
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }

  // 5. Random
  return getEasyMove(board);
}

// Hard: Minimax (perfect play)
function minimax(
  board: TicTacToeBoardState,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  if (checkTTTWin(board, aiPlayer)) return 10;
  if (checkTTTWin(board, humanPlayer)) return -10;
  if (checkTTTDraw(board)) return 0;

  const emptyPositions = getEmptyPositions(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const pos of emptyPositions) {
      const newBoard = [...board] as TicTacToeBoardState;
      newBoard[pos] = aiPlayer;
      const score = minimax(newBoard, false, aiPlayer, humanPlayer);
      best = Math.max(best, score);
    }
    return best;
  } else {
    let best = Infinity;
    for (const pos of emptyPositions) {
      const newBoard = [...board] as TicTacToeBoardState;
      newBoard[pos] = humanPlayer;
      const score = minimax(newBoard, true, aiPlayer, humanPlayer);
      best = Math.min(best, score);
    }
    return best;
  }
}

export function getHardMove(
  board: TicTacToeBoardState,
  aiPlayer: Player
): number {
  const humanPlayer: Player = aiPlayer === 1 ? 2 : 1;
  const emptyPositions = getEmptyPositions(board);

  if (emptyPositions.length === 0) return -1;
  if (emptyPositions.length === 9) return 4; // First move: take center

  let bestScore = -Infinity;
  let bestMove = emptyPositions[0];

  for (const pos of emptyPositions) {
    const newBoard = [...board] as TicTacToeBoardState;
    newBoard[pos] = aiPlayer;
    const score = minimax(newBoard, false, aiPlayer, humanPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = pos;
    }
  }

  return bestMove;
}

export function getAIMove(
  board: TicTacToeBoardState,
  difficulty: Difficulty,
  aiPlayer: Player
): number {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board);
    case 'medium':
      return getMediumMove(board, aiPlayer);
    case 'hard':
      return getHardMove(board, aiPlayer);
    default:
      return getEasyMove(board);
  }
}
