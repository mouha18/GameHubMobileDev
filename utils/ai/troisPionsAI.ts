import { Player, Difficulty, TroisPionsBoardState } from '../../types';
import {
  checkTroisPionsWin,
  getEmptyPositions,
  TROIS_PIONS_WIN_LINES,
  TROIS_PIONS_ADJACENCY,
} from '../gameHelpers';

// Get valid moves for 3 Pions (movement phase)
function getValidMoves(
  board: TroisPionsBoardState,
  player: Player
): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  board.forEach((cell, from) => {
    if (cell === player) {
      TROIS_PIONS_ADJACENCY[from].forEach((to) => {
        if (board[to] === null) {
          moves.push({ from, to });
        }
      });
    }
  });
  return moves;
}

// Evaluate board for minimax
function evaluateBoard(
  board: TroisPionsBoardState,
  aiPlayer: Player
): number {
  const humanPlayer: Player = aiPlayer === 1 ? 2 : 1;

  if (checkTroisPionsWin(board, aiPlayer)) return 100;
  if (checkTroisPionsWin(board, humanPlayer)) return -100;

  let score = 0;

  // Count lines where AI has 2 pieces and 3rd is empty
  for (const line of TROIS_PIONS_WIN_LINES) {
    const aiCount = line.filter((pos) => board[pos] === aiPlayer).length;
    const emptyCount = line.filter((pos) => board[pos] === null).length;
    if (aiCount === 2 && emptyCount === 1) {
      score += 5;
    }

    const humanCount = line.filter((pos) => board[pos] === humanPlayer).length;
    if (humanCount === 2 && emptyCount === 1) {
      score -= 5;
    }
  }

  // Bonus for center
  if (board[4] === aiPlayer) {
    score += 2;
  }

  return score;
}

// Easy: Random move
export function getEasyMove(
  board: TroisPionsBoardState,
  phase: 'placement' | 'movement',
  player: Player
): { type: 'place'; position: number } | { type: 'move'; from: number; to: number } {
  if (phase === 'placement') {
    const emptyPositions = getEmptyPositions(board);
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return { type: 'place', position: emptyPositions[randomIndex] };
  } else {
    const moves = getValidMoves(board, player);
    if (moves.length === 0) {
      // No valid moves - stalemate
      return { type: 'place', position: -1 };
    }
    const randomIndex = Math.floor(Math.random() * moves.length);
    const move = moves[randomIndex];
    return { type: 'move', from: move.from, to: move.to };
  }
}

// Medium: Heuristic-based
export function getMediumMove(
  board: TroisPionsBoardState,
  phase: 'placement' | 'movement',
  aiPlayer: Player
): { type: 'place'; position: number } | { type: 'move'; from: number; to: number } {
  const humanPlayer: Player = aiPlayer === 1 ? 2 : 1;

  if (phase === 'placement') {
    const emptyPositions = getEmptyPositions(board);

    // 1. Win if possible
    for (const pos of emptyPositions) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[pos] = aiPlayer;
      if (checkTroisPionsWin(testBoard, aiPlayer)) {
        return { type: 'place', position: pos };
      }
    }

    // 2. Block opponent win
    for (const pos of emptyPositions) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[pos] = humanPlayer;
      if (checkTroisPionsWin(testBoard, humanPlayer)) {
        return { type: 'place', position: pos };
      }
    }

    // 3. Take center if available
    if (board[4] === null) {
      return { type: 'place', position: 4 };
    }

    // 4. Random
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return { type: 'place', position: emptyPositions[randomIndex] };
  } else {
    const moves = getValidMoves(board, aiPlayer);

    // 1. Win immediately
    for (const move of moves) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[move.to] = aiPlayer;
      testBoard[move.from] = null;
      if (checkTroisPionsWin(testBoard, aiPlayer)) {
        return { type: 'move', from: move.from, to: move.to };
      }
    }

    // 2. Block opponent win
    for (const move of moves) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[move.to] = aiPlayer;
      testBoard[move.from] = null;
      // Check if opponent would win after our move
      const opponentMoves = getValidMoves(testBoard, humanPlayer);
      for (const oppMove of opponentMoves) {
        const oppTestBoard = [...testBoard] as TroisPionsBoardState;
        oppTestBoard[oppMove.to] = humanPlayer;
        oppTestBoard[oppMove.from] = null;
        if (checkTroisPionsWin(oppTestBoard, humanPlayer)) {
          return { type: 'move', from: move.from, to: move.to };
        }
      }
    }

    if (moves.length === 0) {
      return { type: 'place', position: -1 };
    }

    // 3. Random
    const randomIndex = Math.floor(Math.random() * moves.length);
    const move = moves[randomIndex];
    return { type: 'move', from: move.from, to: move.to };
  }
}

// Main export function - getAIMove
export function getAIMove(
  board: TroisPionsBoardState,
  difficulty: Difficulty,
  aiPlayer: Player
): number {
  // Determine phase based on board state
  const playerCount = board.filter((p) => p === aiPlayer).length;
  const phase: 'placement' | 'movement' = playerCount >= 3 ? 'movement' : 'placement';

  switch (difficulty) {
    case 'easy':
      const easyMove = getEasyMove(board, phase, aiPlayer);
      if (easyMove.type === 'place') return easyMove.position;
      return easyMove.from; // Fallback

    case 'medium': {
      const mediumMove = getMediumMove(board, phase, aiPlayer);
      if (mediumMove.type === 'place') return mediumMove.position;
      return mediumMove.from; // Fallback
    }

    case 'hard': {
      const hardMove = getHardMove(board, aiPlayer, phase);
      if (hardMove.type === 'place') return hardMove.position;
      return hardMove.from; // Fallback
    }

    default:
      return -1;
  }
}

// Alias for backwards compatibility
export const getTroisPionsAIMove = getAIMove;

// Hard: Minimax with alpha-beta pruning - properly implemented
function getHardMove(
  board: TroisPionsBoardState,
  aiPlayer: Player,
  phase: 'placement' | 'movement'
): { type: 'place'; position: number } | { type: 'move'; from: number; to: number } {
  const humanPlayer: Player = aiPlayer === 1 ? 2 : 1;
  
  if (phase === 'placement') {
    const emptyPositions = getEmptyPositions(board);
    let bestScore = -Infinity;
    let bestPosition = emptyPositions[0];
    
    for (const pos of emptyPositions) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[pos] = aiPlayer;
      const score = minimax(testBoard, 3, -Infinity, Infinity, false, aiPlayer, humanPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestPosition = pos;
      }
    }
    
    return { type: 'place', position: bestPosition };
  } else {
    const moves = getValidMoves(board, aiPlayer);
    if (moves.length === 0) {
      return { type: 'place', position: -1 };
    }
    
    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    for (const move of moves) {
      const testBoard = [...board] as TroisPionsBoardState;
      testBoard[move.to] = testBoard[move.from];
      testBoard[move.from] = null;
      const score = minimax(testBoard, 3, -Infinity, Infinity, false, aiPlayer, humanPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return { type: 'move', from: bestMove.from, to: bestMove.to };
  }
}

// Minimax with alpha-beta pruning for 3 Pions
function minimax(
  board: TroisPionsBoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
  
  // Check terminal states
  if (checkTroisPionsWin(board, aiPlayer)) return 100 + depth; // Prefer faster wins
  if (checkTroisPionsWin(board, humanPlayer)) return -100 - depth; // Prefer slower losses
  
  if (depth === 0) {
    return evaluateBoardForMinimax(board, aiPlayer, humanPlayer);
  }
  
  // Determine phase based on pieces placed
  const playerCount = board.filter((p) => p === currentPlayer).length;
  const phase: 'placement' | 'movement' = playerCount >= 3 ? 'movement' : 'placement';
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    
    if (phase === 'placement') {
      const emptyPositions = getEmptyPositions(board);
      for (const pos of emptyPositions) {
        const testBoard = [...board] as TroisPionsBoardState;
        testBoard[pos] = aiPlayer;
        const evaluation = minimax(testBoard, depth - 1, alpha, beta, false, aiPlayer, humanPlayer);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    } else {
      const moves = getValidMoves(board, aiPlayer);
      if (moves.length === 0) {
        // No moves available - stalemate
        return evaluateBoardForMinimax(board, aiPlayer, humanPlayer);
      }
      for (const move of moves) {
        const testBoard = [...board] as TroisPionsBoardState;
        testBoard[move.to] = testBoard[move.from];
        testBoard[move.from] = null;
        const evaluation = minimax(testBoard, depth - 1, alpha, beta, false, aiPlayer, humanPlayer);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    
    if (phase === 'placement') {
      const emptyPositions = getEmptyPositions(board);
      for (const pos of emptyPositions) {
        const testBoard = [...board] as TroisPionsBoardState;
        testBoard[pos] = humanPlayer;
        const evaluation = minimax(testBoard, depth - 1, alpha, beta, true, aiPlayer, humanPlayer);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    } else {
      const moves = getValidMoves(board, humanPlayer);
      if (moves.length === 0) {
        // No moves available - stalemate
        return evaluateBoardForMinimax(board, aiPlayer, humanPlayer);
      }
      for (const move of moves) {
        const testBoard = [...board] as TroisPionsBoardState;
        testBoard[move.to] = testBoard[move.from];
        testBoard[move.from] = null;
        const evaluation = minimax(testBoard, depth - 1, alpha, beta, true, aiPlayer, humanPlayer);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }
    
    return minEval;
  }
}

// Evaluate board state for minimax
function evaluateBoardForMinimax(
  board: TroisPionsBoardState,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  let score = 0;
  
  // Count lines where AI has 2 pieces and 3rd is empty (potential win)
  for (const line of TROIS_PIONS_WIN_LINES) {
    const aiCount = line.filter((pos) => board[pos] === aiPlayer).length;
    const humanCount = line.filter((pos) => board[pos] === humanPlayer).length;
    const emptyCount = line.filter((pos) => board[pos] === null).length;
    
    if (aiCount === 2 && emptyCount === 1) {
      score += 5;
    }
    if (humanCount === 2 && emptyCount === 1) {
      score -= 5;
    }
  }
  
  // Bonus for center position
  if (board[4] === aiPlayer) {
    score += 2;
  } else if (board[4] === humanPlayer) {
    score -= 2;
  }
  
  // Count pieces on board
  const aiPieces = board.filter((p) => p === aiPlayer).length;
  const humanPieces = board.filter((p) => p === humanPlayer).length;
  score += (aiPieces - humanPieces) * 0.5;
  
  return score;
}
