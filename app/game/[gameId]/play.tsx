import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlayerInfo } from '../../../components/ui/PlayerInfo';
import { TurnIndicator } from '../../../components/ui/TurnIndicator';
import { MenuModal, GameOverModal } from '../../../components/ui/Modal';
import { TicTacToeBoard } from '../../../components/games/TicTacToe/TicTacToeBoard';
import { TroisPionsBoard } from '../../../components/games/TroisPions/TroisPionsBoard';
import { CheckersBoard } from '../../../components/games/Checkers/CheckersBoard';
import { ChessBoard } from '../../../components/games/Chess/ChessBoard';
import { getGameMeta } from '../../../constants/games';
import { COLORS, FONT_SIZES, SPACING } from '../../../constants/theme';
import {
  GameId,
  GameMode,
  Difficulty,
  Player,
  TicTacToeState,
  TroisPionsState,
  CheckersState,
  ChessState,
  CheckersMove,
  ChessMove,
} from '../../../types';
import { useGameStore } from '../../../store/gameStore';
import { getAIMove as getTTT_AIMove } from '../../../utils/ai/ticTacToeAI';
import { getAIMove as getTroisPionsAIMove } from '../../../utils/ai/troisPionsAI';
import { getAICheckersMove, getCheckersValidMoves, getJumpsForPiece } from '../../../utils/ai/checkersAI';
import { getAIChessMove, getChessValidMoves, createInitialChessBoard } from '../../../utils/ai/chessAI';
import {
  checkTTTWin,
  checkTTTDraw,
  checkTroisPionsWin,
  TROIS_PIONS_ADJACENCY,
} from '../../../utils/gameHelpers';

// Initialize game states
function createInitialTicTacToeState(): TicTacToeState {
  return {
    board: Array(9).fill(null),
    currentPlayer: 1,
    status: 'playing',
    winner: null,
    winningLine: null,
  };
}

function createInitialTroisPionsState(): TroisPionsState {
  return {
    board: Array(9).fill(null),
    phase: 'placement',
    currentPlayer: 1,
    piecesPlaced: { 1: 0, 2: 0 },
    selectedPosition: null,
    round: 1,
    roundScores: { 1: 0, 2: 0 },
    status: 'playing',
    winner: null,
  };
}

function createInitialCheckersState(): CheckersState {
  const board = Array(8)
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

  return {
    board,
    currentPlayer: 1,
    selectedSquare: null,
    validMoves: [],
    mustJump: false,
    jumpChain: [],
    status: 'playing',
    winner: null,
  };
}

function createInitialChessState(): ChessState {
  return {
    board: createInitialChessBoard(),
    currentPlayer: 1,
    selectedSquare: null,
    validMoves: [],
    enPassantTarget: null,
    castlingRights: {
      1: { kingSide: true, queenSide: true },
      2: { kingSide: true, queenSide: true },
    },
    isCheck: false,
    status: 'playing',
    winner: null,
  };
}

export default function GamePlayScreen() {
  const navigation = useNavigation();
  const { gameId, mode: routeMode, difficulty: routeDifficulty, playerSide: routePlayerSide, checkersRules: routeCheckersRules, checkersCaptureRequired: routeCaptureRequired } = useLocalSearchParams();

  const game = getGameMeta(gameId as GameId);
  const config = useGameStore((state) => state.config);
  const players = useGameStore((state) => state.players);

  const [menuVisible, setMenuVisible] = useState(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);

  // Checkers rule settings
  const checkersRules = (routeCheckersRules as 'american' | 'international') || 'american';
  const captureRequired = routeCaptureRequired !== 'false';

  // Game states
  const [tttState, setTttState] = useState<TicTacToeState>(createInitialTicTacToeState);
  const [troisPionsState, setTroisPionsState] = useState<TroisPionsState>(createInitialTroisPionsState);
  const [checkersState, setCheckersState] = useState<CheckersState>(createInitialCheckersState);
  const [chessState, setChessState] = useState<ChessState>(createInitialChessState);

  const isPvC = routeMode === 'pvc';
  const difficulty = (routeDifficulty as Difficulty) || 'medium';
  const humanPlayer = routePlayerSide ? Number(routePlayerSide) as Player : 1;
  const aiPlayer: Player = humanPlayer === 1 ? 2 : 1;

  const getCurrentState = () => {
    switch (gameId) {
      case 'tic-tac-toe':
        return tttState;
      case 'trois-pions':
        return troisPionsState;
      case 'checkers':
        return checkersState;
      case 'chess':
        return chessState;
      default:
        return tttState;
    }
  };

  const getCurrentPlayer = (): Player => {
    switch (gameId) {
      case 'tic-tac-toe':
        return tttState.currentPlayer;
      case 'trois-pions':
        return troisPionsState.currentPlayer;
      case 'checkers':
        return checkersState.currentPlayer;
      case 'chess':
        return chessState.currentPlayer;
      default:
        return 1;
    }
  };

  const isAITurn = isPvC && getCurrentPlayer() === aiPlayer;

  // Reset game
  const resetGame = useCallback(() => {
    setTttState(createInitialTicTacToeState());
    setTroisPionsState(createInitialTroisPionsState());
    setCheckersState(createInitialCheckersState());
    setChessState(createInitialChessState());
    setGameOverVisible(false);
  }, []);

  // Go home
  const goHome = useCallback(() => {
    router.replace('/');
  }, []);

  // AI Move Effect
  useEffect(() => {
    if (!isAITurn || gameOverVisible) return;

    const timer = setTimeout(() => {
      switch (gameId) {
        case 'tic-tac-toe':
          handleTTT_AIMove();
          break;
        case 'trois-pions':
          handleTroisPionsAIMove();
          break;
        case 'checkers':
          handleCheckersAIMove();
          break;
        case 'chess':
          handleChessAIMove();
          break;
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isAITurn, gameOverVisible, gameId]);

  // Tic Tac Toe AI Move
  const handleTTT_AIMove = () => {
    const aiMove = getTTT_AIMove(tttState.board, difficulty, aiPlayer);
    if (aiMove !== -1) {
      const newBoard = [...tttState.board] as (Player | null)[];
      newBoard[aiMove] = aiPlayer;
      const winner = checkTTTWin(newBoard, aiPlayer) ? aiPlayer : null;
      const isDraw = !winner && checkTTTDraw(newBoard);

      // Find winning line
      let winningLine: number[] | null = null;
      if (winner) {
        const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6],
        ];
        for (const line of lines) {
          if (line.every(i => newBoard[i] === aiPlayer)) {
            winningLine = line;
            break;
          }
        }
      }

      setTttState({
        board: newBoard,
        currentPlayer: 1,
        status: winner || isDraw ? 'finished' : 'playing',
        winner: winner || (isDraw ? 'draw' : null),
        winningLine,
      });

      if (winner || isDraw) {
        setGameOverVisible(true);
      }
    }
  };

  // 3 Pions AI Move
  const handleTroisPionsAIMove = () => {
    const state = troisPionsState;
    let newBoard: (Player | null)[];

    if (state.phase === 'placement') {
      const emptyPositions = state.board
        .map((p, i) => p === null ? i : -1)
        .filter(i => i !== -1);
      if (emptyPositions.length > 0) {
        const move = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        newBoard = [...state.board];
        newBoard[move] = aiPlayer;
        
        const win = checkTroisPionsWin(newBoard, aiPlayer);
        const piecesPlaced = { ...state.piecesPlaced, [aiPlayer]: state.piecesPlaced[aiPlayer] + 1 };
        
        if (win || piecesPlaced[1] + piecesPlaced[2] === 6) {
          const nextPhase = piecesPlaced[1] + piecesPlaced[2] === 6 ? 'movement' : 'placement';
          const winner = win ? aiPlayer : null;
          
          setTroisPionsState({
            ...state,
            board: newBoard,
            piecesPlaced,
            phase: nextPhase,
            currentPlayer: 1,
            status: winner ? 'finished' : 'playing',
            winner,
          });
          
          if (winner || nextPhase === 'movement') {
            if (winner) setGameOverVisible(true);
          }
        } else {
          setTroisPionsState({
            ...state,
            board: newBoard,
            piecesPlaced,
            currentPlayer: 1,
          });
        }
      }
    } else {
      // Movement phase - simple random move
      const myPieces = state.board
        .map((p, i) => p === aiPlayer ? i : -1)
        .filter(i => i !== -1);
      
      if (myPieces.length > 0) {
        const from = myPieces[Math.floor(Math.random() * myPieces.length)];
        const validMoves = TROIS_PIONS_ADJACENCY[from]
          .filter(to => state.board[to] === null);
        
        if (validMoves.length > 0) {
          const to = validMoves[Math.floor(Math.random() * validMoves.length)];
          newBoard = [...state.board];
          newBoard[to] = newBoard[from]!;
          newBoard[from] = null;
          
          const win = checkTroisPionsWin(newBoard, aiPlayer);
          
          setTroisPionsState({
            ...state,
            board: newBoard,
            currentPlayer: 1,
            selectedPosition: null,
            status: win ? 'finished' : 'playing',
            winner: win ? aiPlayer : null,
          });
          
          if (win) setGameOverVisible(true);
        }
      }
    }
  };

  // Checkers AI Move
  const handleCheckersAIMove = () => {
    const aiMove = getAICheckersMove(checkersState.board, difficulty, aiPlayer, checkersRules, captureRequired);
    if (aiMove) {
      const newBoard = checkersState.board.map(row => [...row]) as typeof checkersState.board;
      newBoard[aiMove.to[0]][aiMove.to[1]] = newBoard[aiMove.from[0]][aiMove.from[1]];
      newBoard[aiMove.from[0]][aiMove.from[1]] = null;

      if (aiMove.captured) {
        for (const [cr, cc] of aiMove.captured) {
          newBoard[cr][cc] = null;
        }
      }

      // Check for promotion
      const piece = newBoard[aiMove.to[0]][aiMove.to[1]];
      if (piece) {
        const promotionRow = aiPlayer === (1 as Player) ? 0 : 7;
        if (aiMove.to[0] === promotionRow) {
          piece.type = 'king';
        }
      }

      // Check for win
      let opponentPieces = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (newBoard[r][c]?.player === humanPlayer) opponentPieces++;
        }
      }

      // Check if human player has any valid moves (draw if blocked)
      const humanMoves = getCheckersValidMoves(newBoard, humanPlayer, checkersRules, captureRequired);
      const isDraw = humanMoves.length === 0 && opponentPieces > 0;

      setCheckersState({
        ...checkersState,
        board: newBoard,
        currentPlayer: humanPlayer,
        selectedSquare: null,
        validMoves: [],
        mustJump: false,
        jumpChain: [],
        status: opponentPieces === 0 || isDraw ? 'finished' : 'playing',
        winner: opponentPieces === 0 ? aiPlayer : isDraw ? null : null,
      });

      if (opponentPieces === 0 || isDraw) setGameOverVisible(true);
    }
  };

  // Chess AI Move
  const handleChessAIMove = () => {
    const aiMove = getAIChessMove(
      chessState.board,
      difficulty,
      aiPlayer,
      chessState.enPassantTarget,
      chessState.castlingRights
    );

    if (aiMove) {
      const newBoard = chessState.board.map(row => [...row]) as typeof chessState.board;
      const piece = newBoard[aiMove.from[0]][aiMove.from[1]];

      if (piece) {
        newBoard[aiMove.to[0]][aiMove.to[1]] = piece;
        newBoard[aiMove.from[0]][aiMove.from[1]] = null;

        // Handle en passant
        let newEnPassant: [number, number] | null = null;
        if (aiMove.enPassant) {
          newBoard[aiMove.from[0]][aiMove.to[1]] = null;
        }

        // Handle pawn double move
        if (piece.type === 'pawn' && Math.abs(aiMove.to[0] - aiMove.from[0]) === 2) {
          newEnPassant = [(aiMove.from[0] + aiMove.to[0]) / 2, aiMove.from[1]];
        }

        // Handle promotion
        if (aiMove.promoteTo) {
          piece.type = aiMove.promoteTo;
        }

        // Handle castling
        let newCastling = { ...chessState.castlingRights };
        if (aiMove.castling) {
          const rookFromCol = aiMove.castling === 'kingSide' ? 7 : 0;
          const rookToCol = aiMove.castling === 'kingSide' ? 5 : 3;
          const rook = newBoard[aiMove.from[0]][rookFromCol];
          newBoard[aiMove.from[0]][rookToCol] = rook;
          newBoard[aiMove.from[0]][rookFromCol] = null;
          if (rook) rook.hasMoved = true;
        }

        if (piece.type === 'king' || piece.type === 'rook') {
          piece.hasMoved = true;
        }

        // After AI move, switch to human player but don't show all valid moves
        const isCheck = false; // Simplified - would need proper check detection
        
        setChessState({
          ...chessState,
          board: newBoard,
          currentPlayer: humanPlayer,
          selectedSquare: null,
          validMoves: [],  // Don't show all moves - only show when piece selected
          enPassantTarget: newEnPassant,
          castlingRights: newCastling,
          isCheck,
        });
      }
    }
  };

  // Tic Tac Toe Cell Press
  const handleTTTCellPress = (index: number) => {
    if (tttState.status !== 'playing' || isAITurn) return;
    if (tttState.board[index] !== null) return;

    const newBoard = [...tttState.board] as (Player | null)[];
    newBoard[index] = 1;

    const winner = checkTTTWin(newBoard, 1) ? 1 : null;
    const isDraw = !winner && checkTTTDraw(newBoard);

    let winningLine: number[] | null = null;
    if (winner) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const line of lines) {
        if (line.every(i => newBoard[i] === 1)) {
          winningLine = line;
          break;
        }
      }
    }

    setTttState({
      board: newBoard,
      currentPlayer: isPvC ? 2 : 2,
      status: winner || isDraw ? 'finished' : 'playing',
      winner: winner || (isDraw ? 'draw' : null),
      winningLine,
    });

    if (winner || isDraw) {
      setGameOverVisible(true);
    }
  };

  // 3 Pions Position Press
  const handleTroisPionsPress = (index: number) => {
    const state = troisPionsState;
    if (state.status !== 'playing' || isAITurn) return;

    let newState = state;

    if (state.phase === 'placement') {
      if (state.board[index] !== null) return;

      const newBoard = [...state.board];
      newBoard[index] = state.currentPlayer;

      const win = checkTroisPionsWin(newBoard, state.currentPlayer);
      const piecesPlaced = {
        ...state.piecesPlaced,
        [state.currentPlayer]: state.piecesPlaced[state.currentPlayer] + 1,
      };

      const totalPlaced = piecesPlaced[1] + piecesPlaced[2];

      if (win || totalPlaced === 6) {
        const nextPhase = totalPlaced === 6 && !win ? 'movement' : 'placement';
        const winner = win ? state.currentPlayer : null;

        newState = {
          ...state,
          board: newBoard,
          piecesPlaced,
          phase: nextPhase,
          currentPlayer: state.currentPlayer === 1 ? 2 : 1,
          status: winner ? 'finished' : 'playing',
          winner,
        };

        if (winner) setGameOverVisible(true);
      } else {
        newState = {
          ...state,
          board: newBoard,
          piecesPlaced,
          currentPlayer: state.currentPlayer === 1 ? 2 : 1,
        };
      }
    } else {
      // Movement phase
      const piece = state.board[index];

      if (piece === state.currentPlayer) {
        // Select own piece
        newState = {
          ...state,
          selectedPosition: index,
        };
      } else if (piece === null && state.selectedPosition !== null) {
        // Move to empty square
        const validMoves = TROIS_PIONS_ADJACENCY[state.selectedPosition];
        if (validMoves.includes(index)) {
          const newBoard = [...state.board];
          newBoard[index] = newBoard[state.selectedPosition]!;
          newBoard[state.selectedPosition] = null;

          const win = checkTroisPionsWin(newBoard, state.currentPlayer);

          newState = {
            ...state,
            board: newBoard,
            selectedPosition: null,
            currentPlayer: state.currentPlayer === 1 ? 2 : 1,
            status: win ? 'finished' : 'playing',
            winner: win ? state.currentPlayer : null,
          };

          if (win) setGameOverVisible(true);
        }
      } else {
        // Deselect
        newState = {
          ...state,
          selectedPosition: null,
        };
      }
    }

    setTroisPionsState(newState);
  };

  // Checkers Square Press
  const handleCheckersPress = (row: number, col: number) => {
    if (checkersState.status !== 'playing' || isAITurn) return;

    const piece = checkersState.board[row][col];
    const isSelected = checkersState.selectedSquare?.[0] === row && checkersState.selectedSquare?.[1] === col;

    if (isSelected) {
      // Deselect
      setCheckersState({
        ...checkersState,
        selectedSquare: null,
        validMoves: [],
      });
      return;
    }

    // Check if clicking on a valid move destination
    const move = checkersState.validMoves.find(m => m.to[0] === row && m.to[1] === col);
    if (move && checkersState.selectedSquare) {
      // Execute the move
      const newBoard = checkersState.board.map(r => [...r]) as typeof checkersState.board;
      newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
      newBoard[move.from[0]][move.from[1]] = null;

      // Handle captures
      if (move.captured) {
        for (const [cr, cc] of move.captured) {
          newBoard[cr][cc] = null;
        }
      }

      // Check for promotion
      const movedPiece = newBoard[move.to[0]][move.to[1]];
      if (movedPiece) {
        const promotionRow = movedPiece.player === 1 ? 0 : 7;
        if (move.to[0] === promotionRow) {
          movedPiece.type = 'king';
        }
      }

      // Check if this was a capture and if more jumps are available
      const isCapture = move.captured && move.captured.length > 0;
      let mustContinueJumping = false;
      let additionalJumps: CheckersMove[] = [];

      if (isCapture && movedPiece) {
        // Check if the moved piece can capture again
        const fromRow = move.to[0];
        const fromCol = move.to[1];
        additionalJumps = getJumpsForPiece(newBoard, fromRow, fromCol, movedPiece.player, checkersRules);
        
        // If there are more jumps and captures are mandatory (or player chooses to continue)
        if (additionalJumps.length > 0) {
          if (captureRequired) {
            // Must continue jumping
            mustContinueJumping = true;
          } else {
            // Optional - show both options (continue or pass turn)
            mustContinueJumping = false;
          }
        }
      }

      // If must continue jumping, don't switch turns
      if (mustContinueJumping && additionalJumps.length > 0) {
        setCheckersState({
          ...checkersState,
          board: newBoard,
          currentPlayer: checkersState.currentPlayer, // Stay with same player
          selectedSquare: [move.to[0], move.to[1]],
          validMoves: additionalJumps,
          mustJump: true,
          jumpChain: [...checkersState.jumpChain, move.to],
          status: 'playing',
          winner: null,
        });
        return;
      }

      // Check for win
      const opponentPlayer = checkersState.currentPlayer === 1 ? 2 : 1;
      let opponentPieces = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (newBoard[r][c]?.player === opponentPlayer) opponentPieces++;
        }
      }

      setCheckersState({
        ...checkersState,
        board: newBoard,
        currentPlayer: opponentPlayer,
        selectedSquare: null,
        validMoves: [],
        mustJump: false,
        jumpChain: [],
        status: opponentPieces === 0 ? 'finished' : 'playing',
        winner: opponentPieces === 0 ? checkersState.currentPlayer : null,
      });

      if (opponentPieces === 0) setGameOverVisible(true);
      
      // Check if opponent has any valid moves (draw if blocked)
      const opponentMoves = getCheckersValidMoves(newBoard, opponentPlayer, checkersRules, captureRequired);
      if (opponentMoves.length === 0 && opponentPieces > 0) {
        setCheckersState({
          ...checkersState,
          board: newBoard,
          currentPlayer: opponentPlayer,
          selectedSquare: null,
          validMoves: [],
          mustJump: false,
          jumpChain: [],
          status: 'finished',
          winner: null,
        });
        setGameOverVisible(true);
        return;
      }
      
      return;
    }

    if (piece?.player === checkersState.currentPlayer) {
      // Calculate valid moves for this piece - get all moves then filter
      const allMoves = getCheckersValidMoves(checkersState.board, checkersState.currentPlayer, checkersRules, captureRequired);
      const pieceMoves = allMoves.filter(m => m.from[0] === row && m.from[1] === col);
      
      setCheckersState({
        ...checkersState,
        selectedSquare: [row, col],
        validMoves: pieceMoves,
      });
    }
  };

  // Chess Square Press
  const handleChessPress = (row: number, col: number) => {
    if (chessState.status !== 'playing' || isAITurn) return;

    const piece = chessState.board[row][col];
    const isSelected = chessState.selectedSquare?.[0] === row && chessState.selectedSquare?.[1] === col;

    if (isSelected) {
      setChessState({
        ...chessState,
        selectedSquare: null,
        validMoves: [],
      });
      return;
    }

    // Check if clicking on a valid move
    const move = chessState.validMoves.find(m => m.to[0] === row && m.to[1] === col);
    if (move && chessState.selectedSquare) {
      // Execute move
      const newBoard = chessState.board.map(r => [...r]) as typeof chessState.board;
      const movingPiece = newBoard[chessState.selectedSquare[0]][chessState.selectedSquare[1]];

      if (movingPiece) {
        newBoard[row][col] = movingPiece;
        newBoard[chessState.selectedSquare[0]][chessState.selectedSquare[1]] = null;

        // Handle promotion
        if (move.promoteTo) {
          movingPiece.type = move.promoteTo;
        }

        const newValidMoves = getChessValidMoves(newBoard, humanPlayer, null, chessState.castlingRights);

        setChessState({
          ...chessState,
          board: newBoard,
          selectedSquare: null,
          validMoves: [],  // Clear valid moves after move
          currentPlayer: aiPlayer,
        });
      }
      return;
    }

    // Select own piece
    if (piece?.player === chessState.currentPlayer) {
      const validMoves = getChessValidMoves(
        chessState.board,
        chessState.currentPlayer,
        chessState.enPassantTarget,
        chessState.castlingRights
      ).filter(m => m.from[0] === row && m.from[1] === col);

      setChessState({
        ...chessState,
        selectedSquare: [row, col],
        validMoves: validMoves,
      });
    }
  };

  const renderBoard = () => {
    switch (gameId) {
      case 'tic-tac-toe':
        return (
          <TicTacToeBoard
            board={tttState.board}
            onCellPress={handleTTTCellPress}
            disabled={isAITurn || tttState.status !== 'playing'}
            winningLine={tttState.winningLine}
          />
        );
      case 'trois-pions':
        return (
          <TroisPionsBoard
            board={troisPionsState.board}
            selectedPosition={troisPionsState.selectedPosition}
            validMoves={troisPionsState.selectedPosition !== null 
              ? TROIS_PIONS_ADJACENCY[troisPionsState.selectedPosition].filter(
                  i => troisPionsState.board[i] === null
                )
              : []}
            onPositionPress={handleTroisPionsPress}
            disabled={isAITurn || troisPionsState.status !== 'playing'}
            phase={troisPionsState.phase}
          />
        );
      case 'checkers':
        return (
          <CheckersBoard
            board={checkersState.board}
            selectedSquare={checkersState.selectedSquare}
            validMoves={checkersState.validMoves}
            onSquarePress={handleCheckersPress}
            disabled={isAITurn || checkersState.status !== 'playing'}
            playerSide={isPvC ? humanPlayer : humanPlayer}
          />
        );
      case 'chess':
        return (
          <ChessBoard
            board={chessState.board}
            selectedSquare={chessState.selectedSquare}
            validMoves={chessState.validMoves}
            onSquarePress={handleChessPress}
            disabled={isAITurn || chessState.status !== 'playing'}
            isCheck={chessState.isCheck}
            playerSide={isPvC ? humanPlayer : humanPlayer}
          />
        );
      default:
        return null;
    }
  };

  const getWinnerName = () => {
    const state = getCurrentState();
    if ('winner' in state) {
      if (state.winner === 'draw') return null;
      if (state.winner === 1) return players[1].name;
      if (state.winner === 2) return players[2].name;
    }
    return null;
  };

  const isDraw = () => {
    const state = getCurrentState();
    return 'winner' in state && state.winner === 'draw';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <MaterialCommunityIcons name="cog" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.gameTitle}>{game?.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.playerTop}>
        <PlayerInfo
          name={isPvC ? 'Computer' : players[2].name}
          score={players[2].score}
          player={2}
          isActive={getCurrentPlayer() === 2}
          isAI={isPvC}
        />
      </View>

      <View style={styles.boardContainer}>
        {gameId === 'trois-pions' && (
          <Text style={styles.roundText}>
            Round {troisPionsState.round} / 3
          </Text>
        )}
        <TurnIndicator
          currentPlayer={getCurrentPlayer()}
          player1Name={players[1].name}
          player2Name={isPvC ? 'Computer' : players[2].name}
        />
        {renderBoard()}
      </View>

      <View style={styles.playerBottom}>
        <PlayerInfo
          name={players[1].name}
          score={players[1].score}
          player={1}
          isActive={getCurrentPlayer() === 1}
        />
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onResume={() => setMenuVisible(false)}
        onRestart={resetGame}
        onGoHome={goHome}
      />

      <GameOverModal
        visible={gameOverVisible}
        winner={getWinnerName()}
        isDraw={isDraw()}
        onPlayAgain={resetGame}
        onGoHome={goHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  gameTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  playerTop: {
    paddingHorizontal: SPACING.md,
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  playerBottom: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
