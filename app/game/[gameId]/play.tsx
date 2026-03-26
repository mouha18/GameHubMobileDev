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
import { getGameMeta } from '../../../constants/games';
import { COLORS, FONT_SIZES, SPACING } from '../../../constants/theme';
import {
  GameId,
  GameMode,
  Difficulty,
  Player,
  TicTacToeState,
  TroisPionsState,
  TroisPionsBoardState,
  CheckersState,
  CheckersMove,
} from '../../../types';
import { useGameStore } from '../../../store/gameStore';
import { getAIMove as getTTT_AIMove } from '../../../utils/ai/ticTacToeAI';
import { getAIMove as getTroisPionsAIMove } from '../../../utils/ai/troisPionsAI';
import { getAICheckersMove, getCheckersValidMoves, getJumpsForPiece } from '../../../utils/ai/checkersAI';
import {
  checkTTTWin,
  checkTTTDraw,
  checkTroisPionsWin,
  TROIS_PIONS_ADJACENCY,
  checkTroisPionsStalemate,
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

function createInitialTroisPionsState(firstPlayer: Player = 1): TroisPionsState {
  return {
    board: Array(9).fill(null),
    phase: 'placement',
    currentPlayer: firstPlayer,
    piecesPlaced: { 1: 0, 2: 0 },
    selectedPosition: null,
    round: 1,
    roundScores: { 1: 0, 2: 0 },
    status: 'playing',
    winner: null,
  };
}

function createInitialCheckersState(firstPlayer: Player = 1): CheckersState {
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
    currentPlayer: firstPlayer,
    selectedSquare: null,
    validMoves: [],
    mustJump: false,
    jumpChain: [],
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
  const incrementScore = useGameStore((state) => state.incrementScore);

  const [menuVisible, setMenuVisible] = useState(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);

  // Checkers rule settings
  const checkersRules = (routeCheckersRules as 'american' | 'international') || 'american';
  const captureRequired = routeCaptureRequired !== 'false';

  const isPvC = routeMode === 'pvc';
  const difficulty = (routeDifficulty as Difficulty) || 'medium';
  const humanPlayer = routePlayerSide ? Number(routePlayerSide) as Player : 1;
  const aiPlayer: Player = humanPlayer === 1 ? 2 : 1;

  // Game states - initialize after humanPlayer is defined
  const [tttState, setTttState] = useState<TicTacToeState>(createInitialTicTacToeState);
  const [troisPionsState, setTroisPionsState] = useState<TroisPionsState>(() => {
    // If human chooses to play as Player 2 (go second), AI (Player 1) should go first
    const firstPlayer = humanPlayer === 2 ? 1 : humanPlayer;
    return createInitialTroisPionsState(firstPlayer);
  });
  const [checkersState, setCheckersState] = useState<CheckersState>(() => {
    // If human chooses to play as Player 2 (go second), AI (Player 1) should go first
    const firstPlayer = humanPlayer === 2 ? 1 : humanPlayer;
    return createInitialCheckersState(firstPlayer);
  });

  const getCurrentState = () => {
    switch (gameId) {
      case 'tic-tac-toe':
        return tttState;
      case 'trois-pions':
        return troisPionsState;
      case 'checkers':
        return checkersState;
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
      default:
        return 1;
    }
  };

  const isAITurn = isPvC && getCurrentPlayer() === aiPlayer;

  // Reset game
  const resetGame = useCallback(() => {
    setTttState(createInitialTicTacToeState());
    // For 3 Pions and Checkers: If human chooses to play as Player 2 (go second), AI (Player 1) should go first
    // For TicTacToe: Always starts with Player 1
    const firstPlayer = humanPlayer === 2 ? 1 : humanPlayer;
    setTroisPionsState(createInitialTroisPionsState(firstPlayer));
    setCheckersState(createInitialCheckersState(firstPlayer));
    setGameOverVisible(false);
  }, [humanPlayer]);

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
        currentPlayer: humanPlayer,
        status: winner || isDraw ? 'finished' : 'playing',
        winner: winner || (isDraw ? 'draw' : null),
        winningLine,
      });

      if (winner || isDraw) {
        setGameOverVisible(true);
        if (winner) {
          incrementScore(winner);
        }
      }
    }
  };

  // 3 Pions AI Move
  const handleTroisPionsAIMove = () => {
    const state = troisPionsState;
    
    // Use proper AI based on difficulty
    const aiMove = getTroisPionsAIMove(state.board as TroisPionsBoardState, difficulty, aiPlayer);
    
    if (state.phase === 'placement') {
      // AI returns a position for placement
      if (aiMove >= 0) {
        const newBoard = [...state.board];
        newBoard[aiMove] = aiPlayer;
        
        const win = checkTroisPionsWin(newBoard, aiPlayer);
        const piecesPlaced = { ...state.piecesPlaced, [aiPlayer]: state.piecesPlaced[aiPlayer] + 1 };
        const totalPlaced = piecesPlaced[1] + piecesPlaced[2];
        
        if (win || totalPlaced === 6) {
          const nextPhase = totalPlaced === 6 && !win ? 'movement' : 'placement';
          const winner = win ? aiPlayer : null;
          
          setTroisPionsState({
            ...state,
            board: newBoard,
            piecesPlaced,
            phase: nextPhase,
            currentPlayer: humanPlayer,
            status: winner ? 'finished' : 'playing',
            winner,
          });
          
          if (winner) {
            setGameOverVisible(true);
            incrementScore(winner);
          }
        } else {
          setTroisPionsState({
            ...state,
            board: newBoard,
            piecesPlaced,
            currentPlayer: humanPlayer,
          });
        }
      }
    } else {
      // Movement phase - the AI move is the 'from' position, need to find 'to'
      // For movement, getTroisPionsAIMove returns the 'from' position
      // We need to determine valid moves and pick one
      if (aiMove >= 0) {
        const from = aiMove;
        const validMoves = TROIS_PIONS_ADJACENCY[from]
          .filter(to => state.board[to] === null);
        
        if (validMoves.length > 0) {
          // For simplicity, pick a valid move (could be improved with full move return)
          const to = validMoves[0];
          const newBoard = [...state.board];
          newBoard[to] = newBoard[from]!;
          newBoard[from] = null;
          
          const win = checkTroisPionsWin(newBoard, aiPlayer);
          
          // Check for stalemate
          let stalemate = false;
          if (!win) {
            stalemate = checkTroisPionsStalemate(newBoard, humanPlayer);
          }
          
          const winner = win ? aiPlayer : (stalemate ? 'draw' : null);
          
          setTroisPionsState({
            ...state,
            board: newBoard,
            currentPlayer: humanPlayer,
            selectedPosition: null,
            status: win || stalemate ? 'finished' : 'playing',
            winner,
          });
          
          if (win) {
            setGameOverVisible(true);
            incrementScore(aiPlayer);
          } else if (stalemate) {
            setGameOverVisible(true);
          }
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

      // Check if human player has any valid moves (winner if blocked)
      const humanMoves = getCheckersValidMoves(newBoard, humanPlayer, checkersRules, captureRequired);
      
      // Count pieces for both players
      let aiPieces = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (newBoard[r][c]?.player === aiPlayer) aiPieces++;
        }
      }
      
      // Determine winner: if one player has no legal moves but has pieces, the other wins
      // If both cannot move, compare piece counts
      let winner: Player | 'draw' | null = null;
      if (opponentPieces === 0) {
        winner = aiPlayer;
      } else if (humanMoves.length === 0 && opponentPieces > 0) {
        // Human has no legal moves but has pieces
        // Check if AI also has no moves (edge case), otherwise AI wins
        const aiMoves = getCheckersValidMoves(newBoard, aiPlayer, checkersRules, captureRequired);
        if (aiMoves.length === 0) {
          // Both have no moves - compare piece counts
          if (aiPieces > opponentPieces) winner = aiPlayer;
          else if (opponentPieces > aiPieces) winner = humanPlayer;
          else winner = 'draw';
        } else {
          // AI can move - AI wins
          winner = aiPlayer;
        }
      }

      const isGameOver = winner !== null;

      setCheckersState({
        ...checkersState,
        board: newBoard,
        currentPlayer: humanPlayer,
        selectedSquare: null,
        validMoves: [],
        mustJump: false,
        jumpChain: [],
        status: isGameOver ? 'finished' : 'playing',
        winner,
      });

      if (isGameOver) {
        setGameOverVisible(true);
        if (winner && winner !== 'draw') incrementScore(winner);
      }
    }
  };

  // Tic Tac Toe Cell Press
  const handleTTTCellPress = (index: number) => {
    if (tttState.status !== 'playing' || isAITurn) return;
    if (tttState.board[index] !== null) return;

    const currentPlayer = tttState.currentPlayer;
    const newBoard = [...tttState.board] as (Player | null)[];
    newBoard[index] = currentPlayer;

    const winner = checkTTTWin(newBoard, currentPlayer) ? currentPlayer : null;
    const isDraw = !winner && checkTTTDraw(newBoard);

    let winningLine: number[] | null = null;
    if (winner) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const line of lines) {
        if (line.every(i => newBoard[i] === currentPlayer)) {
          winningLine = line;
          break;
        }
      }
    }

    setTttState({
      board: newBoard,
      currentPlayer: currentPlayer === 1 ? 2 : 1,
      status: winner || isDraw ? 'finished' : 'playing',
      winner: winner || (isDraw ? 'draw' : null),
      winningLine,
    });

    if (winner || isDraw) {
      setGameOverVisible(true);
      if (winner) incrementScore(winner);
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

        if (winner) {
          setGameOverVisible(true);
          incrementScore(winner);
        }
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
          
          // Check for stalemate if no win
          let stalemate = false;
          if (!win) {
            const nextPlayer = state.currentPlayer === 1 ? 2 : 1;
            stalemate = checkTroisPionsStalemate(newBoard, nextPlayer);
          }

          const winner = win ? state.currentPlayer : (stalemate ? 'draw' : null);

          newState = {
            ...state,
            board: newBoard,
            selectedPosition: null,
            currentPlayer: state.currentPlayer === 1 ? 2 : 1,
            status: win || stalemate ? 'finished' : 'playing',
            winner,
          };

          if (win || stalemate) {
            setGameOverVisible(true);
            if (win) incrementScore(state.currentPlayer);
          }
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
    const isInJumpChain = checkersState.mustJump && checkersState.selectedSquare;

    // If in a jump chain and clicking on the current piece position, end turn
    if (isInJumpChain && isSelected) {
      setCheckersState({
        ...checkersState,
        selectedSquare: null,
        validMoves: [],
        currentPlayer: checkersState.currentPlayer === 1 ? 2 : 1,
        mustJump: false,
        jumpChain: [],
      });
      return;
    }

    if (isSelected) {
      // Deselect (only if not in jump chain)
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
        
        // If there are more jumps, player can continue or end turn
        if (additionalJumps.length > 0) {
          // Show the additional jumps and let player choose to continue or end
          mustContinueJumping = false;
        }
      }

      // If there are more jumps available, let player choose to continue or end turn
      if (additionalJumps.length > 0) {
        setCheckersState({
          ...checkersState,
          board: newBoard,
          currentPlayer: checkersState.currentPlayer, // Stay with same player
          selectedSquare: [move.to[0], move.to[1]],
          validMoves: additionalJumps,
          mustJump: true, // Track that player is in a jump chain
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

      if (opponentPieces === 0) {
        setGameOverVisible(true);
        incrementScore(checkersState.currentPlayer);
      }
      
      // Check if opponent has any valid moves (draw if blocked)
      const opponentMoves = getCheckersValidMoves(newBoard, opponentPlayer, checkersRules, captureRequired);
      if (opponentMoves.length === 0 && opponentPieces > 0) {
        // Count pieces for both players
        let currentPlayerPieces = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (newBoard[r][c]?.player === checkersState.currentPlayer) currentPlayerPieces++;
          }
        }
        
        // Determine winner: more pieces wins, equal = draw
        let winner: Player | 'draw' | null = null;
        if (currentPlayerPieces > opponentPieces) {
          winner = checkersState.currentPlayer;
        } else if (opponentPieces > currentPlayerPieces) {
          winner = opponentPlayer;
        } else {
          winner = 'draw';
        }
        
        setCheckersState({
          ...checkersState,
          board: newBoard,
          currentPlayer: opponentPlayer,
          selectedSquare: null,
          validMoves: [],
          mustJump: false,
          jumpChain: [],
          status: 'finished',
          winner,
        });
        setGameOverVisible(true);
        if (winner && winner !== 'draw') incrementScore(winner);
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
