import { Player, Difficulty, CheckersBoardState, CheckersMove } from '../../types';

export type CheckersRules = 'american' | 'international';

// Check if a position is on the board
function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Get all possible jumps for a piece
export function getJumpsForPiece(
  board: CheckersBoardState,
  row: number,
  col: number,
  player: Player,
  rules: CheckersRules = 'american'
): CheckersMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const jumps: CheckersMove[] = [];
  const isInternational = rules === 'international';
  const canJumpFar = isInternational && piece.type === 'king';
  
  const directions = piece.type === 'king'
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : player === 1
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of directions) {
    if (canJumpFar) {
      // International rules: king can jump over any opponent piece at any distance
      let checkRow = row + dr;
      let checkCol = col + dc;
      let foundOpponent = false;
      let capturedRow = -1;
      let capturedCol = -1;
      
      // Find the first opponent piece in this direction
      while (isOnBoard(checkRow, checkCol)) {
        if (board[checkRow][checkCol] !== null) {
          if (board[checkRow][checkCol]!.player !== player) {
            // Found opponent piece
            foundOpponent = true;
            capturedRow = checkRow;
            capturedCol = checkCol;
          }
          // Stop after first piece (friend or foe)
          break;
        }
        checkRow += dr;
        checkCol += dc;
      }
      
      // If found opponent and there's empty space after it, can jump
      if (foundOpponent) {
        let destRow = capturedRow + dr;
        let destCol = capturedCol + dc;
        while (isOnBoard(destRow, destCol) && board[destRow][destCol] === null) {
          jumps.push({
            from: [row, col],
            to: [destRow, destCol],
            captured: [[capturedRow, capturedCol]],
          });
          destRow += dr;
          destCol += dc;
        }
      }
    } else {
      // American rules: single adjacent jump
      const midRow = row + dr;
      const midCol = col + dc;
      const destRow = row + 2 * dr;
      const destCol = col + 2 * dc;

      if (
        isOnBoard(destRow, destCol) &&
        board[midRow][midCol] &&
        board[midRow][midCol]!.player !== player &&
        board[destRow][destCol] === null
      ) {
        jumps.push({
          from: [row, col],
          to: [destRow, destCol],
          captured: [[midRow, midCol]],
        });
      }
    }
  }

  return jumps;
}

// Get all possible regular moves for a piece
function getRegularMovesForPiece(
  board: CheckersBoardState,
  row: number,
  col: number,
  player: Player,
  rules: CheckersRules = 'american'
): CheckersMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: CheckersMove[] = [];
  
  // For international rules, kings can slide any distance
  const isInternational = rules === 'international';
  const canSlide = isInternational && piece.type === 'king';
  
  const directions = piece.type === 'king'
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : player === 1
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of directions) {
    if (canSlide) {
      // International rules: king can slide any distance
      let destRow = row + dr;
      let destCol = col + dc;
      while (isOnBoard(destRow, destCol) && board[destRow][destCol] === null) {
        moves.push({
          from: [row, col],
          to: [destRow, destCol],
        });
        destRow += dr;
        destCol += dc;
      }
    } else {
      // American rules: move only 1 square
      const destRow = row + dr;
      const destCol = col + dc;

      if (isOnBoard(destRow, destCol) && board[destRow][destCol] === null) {
        moves.push({
          from: [row, col],
          to: [destRow, destCol],
        });
      }
    }
  }

  return moves;
}

// Get all valid moves for a player
export function getCheckersValidMoves(
  board: CheckersBoardState,
  player: Player,
  rules: CheckersRules = 'american',
  captureRequired: boolean = true
): CheckersMove[] {
  const allJumps: CheckersMove[] = [];
  const allRegularMoves: CheckersMove[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        allJumps.push(...getJumpsForPiece(board, row, col, player, rules));
        allRegularMoves.push(...getRegularMovesForPiece(board, row, col, player, rules));
      }
    }
  }

  // Must jump if required (American rules)
  if (captureRequired && allJumps.length > 0) {
    return allJumps;
  }

  // If not required to capture, return both jumps and regular moves
  return [...allJumps, ...allRegularMoves];
}

// Create initial checkers board
export function createInitialCheckersBoard(): CheckersBoardState {
  const board: CheckersBoardState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = { player: 2, type: 'normal' };
        if (row > 4) board[row][col] = { player: 1, type: 'normal' };
      }
    }
  }

  return board;
}

// Easy: Random move
export function getEasyCheckersMove(
  board: CheckersBoardState,
  player: Player,
  rules: CheckersRules = 'american',
  captureRequired: boolean = true
): CheckersMove | null {
  const moves = getCheckersValidMoves(board, player, rules, captureRequired);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Medium: Greedy - prioritize captures and promotions
export function getMediumCheckersMove(
  board: CheckersBoardState,
  player: Player,
  rules: CheckersRules = 'american',
  captureRequired: boolean = true
): CheckersMove | null {
  const moves = getCheckersValidMoves(board, player, rules, captureRequired);
  if (moves.length === 0) return null;

  // Priority 1: Most captures
  const jumps = moves.filter((m) => m.captured && m.captured.length > 0);
  if (jumps.length > 0) {
    const maxCaptures = Math.max(...jumps.map((m) => m.captured!.length));
    const bestJumps = jumps.filter((m) => m.captured!.length === maxCaptures);
    return bestJumps[Math.floor(Math.random() * bestJumps.length)];
  }

  // Priority 2: Promotion
  const promotionRow = player === 1 ? 0 : 7;
  const promotions = moves.filter((m) => m.to[0] === promotionRow);
  if (promotions.length > 0) {
    return promotions[Math.floor(Math.random() * promotions.length)];
  }

  // Priority 3: Advance toward promotion
  const sortedMoves = [...moves].sort((a, b) => {
    const aAdvancement = player === 1 ? a.to[0] - a.from[0] : a.from[0] - a.to[0];
    const bAdvancement = player === 1 ? b.to[0] - b.from[0] : b.from[0] - b.to[0];
    return bAdvancement - aAdvancement;
  });

  return sortedMoves[0];
}

// Evaluate board state for minimax
function evaluateBoard(
  board: CheckersBoardState,
  aiPlayer: Player
): number {
  let score = 0;
  const opponent: Player = aiPlayer === 1 ? 2 : 1;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const value = piece.type === 'king' ? 5 : 3;
      const advancement = piece.player === 1 ? 7 - row : row;
      const advancementBonus = 0.1 * advancement;

      // Center control bonus
      const centerControl =
        (row >= 3 && row <= 4 && col >= 3 && col <= 4) ? 0.2 : 0;

      if (piece.player === aiPlayer) {
        score += value + advancementBonus + centerControl;
      } else {
        score -= value + advancementBonus + centerControl;
      }
    }
  }

  return score;
}

// Hard: Minimax with alpha-beta pruning
function minimaxCheckers(
  board: CheckersBoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const currentPlayer = isMaximizing ? aiPlayer : (aiPlayer === 1 ? 2 : 1);
  const moves = getCheckersValidMoves(board, currentPlayer);

  if (moves.length === 0) {
    // Current player has no moves - they lose
    return isMaximizing ? -1000 : 1000;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = board.map((row) => [...row]) as CheckersBoardState;
      newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
      newBoard[move.from[0]][move.from[1]] = null;

      // Remove captured pieces
      if (move.captured) {
        for (const [cr, cc] of move.captured) {
          newBoard[cr][cc] = null;
        }
      }

      // Check for promotion
      const piece = newBoard[move.to[0]][move.to[1]];
      if (piece) {
        const promotionRow = currentPlayer === 1 ? 0 : 7;
        if (move.to[0] === promotionRow) {
          piece.type = 'king';
        }
      }

      const evalScore = minimaxCheckers(
        newBoard,
        depth - 1,
        false,
        aiPlayer,
        alpha,
        beta
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = board.map((row) => [...row]) as CheckersBoardState;
      newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
      newBoard[move.from[0]][move.from[1]] = null;

      if (move.captured) {
        for (const [cr, cc] of move.captured) {
          newBoard[cr][cc] = null;
        }
      }

      const piece = newBoard[move.to[0]][move.to[1]];
      if (piece) {
        const promotionRow = currentPlayer === 1 ? 0 : 7;
        if (move.to[0] === promotionRow) {
          piece.type = 'king';
        }
      }

      const evalScore = minimaxCheckers(
        newBoard,
        depth - 1,
        true,
        aiPlayer,
        alpha,
        beta
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getHardCheckersMove(
  board: CheckersBoardState,
  aiPlayer: Player,
  rules: CheckersRules = 'american',
  captureRequired: boolean = true
): CheckersMove | null {
  const moves = getCheckersValidMoves(board, aiPlayer, rules, captureRequired);
  if (moves.length === 0) return null;

  if (moves.length === 1) return moves[0];

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = board.map((row) => [...row]) as CheckersBoardState;
    newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
    newBoard[move.from[0]][move.from[1]] = null;

    if (move.captured) {
      for (const [cr, cc] of move.captured) {
        newBoard[cr][cc] = null;
      }
    }

    const piece = newBoard[move.to[0]][move.to[1]];
    if (piece) {
      const promotionRow = aiPlayer === 1 ? 0 : 7;
      if (move.to[0] === promotionRow) {
        piece.type = 'king';
      }
    }

    const score = minimaxCheckers(newBoard, 3, false, aiPlayer, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAICheckersMove(
  board: CheckersBoardState,
  difficulty: Difficulty,
  aiPlayer: Player,
  rules: CheckersRules = 'american',
  captureRequired: boolean = true
): CheckersMove | null {
  switch (difficulty) {
    case 'easy':
      return getEasyCheckersMove(board, aiPlayer, rules, captureRequired);
    case 'medium':
      return getMediumCheckersMove(board, aiPlayer, rules, captureRequired);
    case 'hard':
      return getHardCheckersMove(board, aiPlayer, rules, captureRequired);
    default:
      return getEasyCheckersMove(board, aiPlayer, rules, captureRequired);
  }
}
