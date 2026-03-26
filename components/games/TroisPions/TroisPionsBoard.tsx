import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { Player } from '../../../types';

interface TroisPionsBoardProps {
  board: (Player | null)[];
  selectedPosition: number | null;
  validMoves: number[];
  onPositionPress: (index: number) => void;
  disabled: boolean;
  phase: 'placement' | 'movement';
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 300);
const POSITION_SIZE = 40;
const PADDING = 8;
const INNER_SIZE = BOARD_SIZE - (PADDING * 2);

// Grid-based position coordinates for 9-point graph
const GRID_POSITIONS = [
  { x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1, y: 0 },
  { x: 0, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0.5 },
  { x: 0, y: 1 }, { x: 0.5, y: 1 }, { x: 1, y: 1 }
];

// Connecting lines between positions (adjacency map)
// Horizontal lines: 0-1, 1-2, 3-4, 4-5, 6-7, 7-8
// Vertical lines: 0-3, 3-6, 1-4, 4-7, 2-5, 5-8
// Diagonal lines: 0-4, 4-8, 2-4, 4-6, 1-5, 3-7
const LINES: [number, number][] = [
  [0, 1], [1, 2],       // Top row
  [3, 4], [4, 5],       // Middle row
  [6, 7], [7, 8],       // Bottom row
  [0, 3], [3, 6],       // Left column
  [1, 4], [4, 7],       // Center column
  [2, 5], [5, 8],       // Right column
  [0, 4], [4, 8],       // Main diagonal
  [2, 4], [4, 6],       // Anti-diagonal
];

// Helper to calculate line properties
function getLineStyle(start: { x: number; y: number }, end: { x: number; y: number }): {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
} {
  const STEP = INNER_SIZE - POSITION_SIZE;
  const startX = PADDING + start.x * STEP + POSITION_SIZE / 2;
  const startY = PADDING + start.y * STEP + POSITION_SIZE / 2;
  const endX   = PADDING + end.x   * STEP + POSITION_SIZE / 2;
  const endY   = PADDING + end.y   * STEP + POSITION_SIZE / 2;

  // Calculate midpoint between start and end
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Calculate line length and angle
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Position at midpoint, offset by half dimensions so rotation is centered
  return {
    left: midX - length / 2,
    top: midY - 1.5, // Half of line height (3/2 = 1.5)
    width: length,
    height: 3,
    rotate: angle,
  };
}

function renderLine(line: [number, number], index: number): React.ReactNode {
  const start = GRID_POSITIONS[line[0]];
  const end = GRID_POSITIONS[line[1]];
  const lineStyle = getLineStyle(start, end);

  return (
    <View
      key={`line-${index}`}
      style={[
        styles.line,
        {
          left: lineStyle.left,
          top: lineStyle.top,
          width: lineStyle.width,
          height: lineStyle.height,
          transform: [{ rotate: `${lineStyle.rotate}deg` }],
        },
      ]}
    />
  );
}

export function TroisPionsBoard({
  board,
  selectedPosition,
  validMoves,
  onPositionPress,
  disabled,
  phase: _phase,
}: TroisPionsBoardProps) {
  const STEP = INNER_SIZE - POSITION_SIZE;
  
  const renderPosition = (index: number) => {
    const pos = GRID_POSITIONS[index];
    const value = board[index];
    const isSelected = selectedPosition === index;
    const isValidMove = validMoves.includes(index);
    const isEmpty = value === null;

    let pieceColor = null;
    if (value === 1) pieceColor = COLORS.player1;
    else if (value === 2) pieceColor = COLORS.player2;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.position,
          {
            left: PADDING + pos.x * STEP,
            top:  PADDING + pos.y * STEP,
          },
          isSelected && styles.selectedPosition,
          isValidMove && !isEmpty && styles.invalidPosition,
        ]}
        onPress={() => !disabled && onPositionPress(index)}
        disabled={disabled}
      >
        {isValidMove && isEmpty && (
          <View style={styles.validMoveIndicator} />
        )}
        {pieceColor && (
          <View
            style={[
              styles.piece,
              { backgroundColor: pieceColor },
              isSelected && styles.selectedPiece,
            ]}
          />
        )}
        {!pieceColor && (
          <View style={styles.emptyPosition} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Render board lines first (below positions) */}
      {LINES.map((line, index) => renderLine(line, index))}
      {/* Render positions on top */}
      {GRID_POSITIONS.map((_, index) => renderPosition(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: PADDING,
    alignSelf: 'center',
  },
  line: {
    position: 'absolute',
    backgroundColor: COLORS.textSecondary,
    zIndex: 1,
  },
  position: {
    position: 'absolute',
    width: POSITION_SIZE,
    height: POSITION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emptyPosition: {
    width: POSITION_SIZE - 10,
    height: POSITION_SIZE - 10,
    borderRadius: (POSITION_SIZE - 10) / 2,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    borderStyle: 'dashed',
  },
  piece: {
    width: POSITION_SIZE - 8,
    height: POSITION_SIZE - 8,
    borderRadius: (POSITION_SIZE - 8) / 2,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  selectedPiece: {
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  selectedPosition: {
    transform: [{ scale: 1.1 }],
  },
  invalidPosition: {
    opacity: 0.5,
  },
  validMoveIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    opacity: 0.6,
  },
});
