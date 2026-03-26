import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, BORDER_RADIUS } from '../../../constants/theme';
import { Player } from '../../../types';

interface TicTacToeBoardProps {
  board: (Player | null)[];
  onCellPress: (index: number) => void;
  disabled: boolean;
  winningLine: number[] | null;
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 300);
const CELL_SIZE = BOARD_SIZE / 3;

interface CellProps {
  value: Player | null;
  index: number;
  onPress: () => void;
  disabled: boolean;
  isWinningCell: boolean;
}

function AnimatedCell({ value, index, onPress, disabled, isWinningCell }: CellProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (value !== null) {
      opacity.value = withTiming(1, { duration: 150 });
    }
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = () => {
    if (!disabled && value === null) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isWinningCell && styles.winningCell,
        !disabled && value === null && styles.cellActive,
      ]}
      onPress={handlePress}
      disabled={disabled || value !== null}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.cellContent, animatedStyle]}>
        {value !== null && (
          <Text
            style={[
              styles.cellText,
              value === 1 ? styles.xText : styles.oText,
              isWinningCell && styles.winningText,
            ]}
          >
            {value === 1 ? '×' : '○'}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function TicTacToeBoard({
  board,
  onCellPress,
  disabled,
  winningLine,
}: TicTacToeBoardProps) {
  return (
    <View style={styles.boardWrapper}>
      <View style={styles.board}>
        {[0, 1, 2].map((i) => (
          <View key={`row-${i}`} style={styles.row}>
            {[0, 1, 2].map((j) => {
              const index = i * 3 + j;
              return (
                <AnimatedCell
                  key={index}
                  value={board[index]}
                  index={index}
                  onPress={() => onCellPress(index)}
                  disabled={disabled}
                  isWinningCell={winningLine?.includes(index) ?? false}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    backgroundColor: COLORS.primary,
    margin: 3,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: CELL_SIZE - 8,
  },
  cellActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    borderStyle: 'dashed',
  },
  winningCell: {
    backgroundColor: COLORS.success,
    borderWidth: 0,
  },
  cellContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: FONT_SIZES.xxl * 1.5,
    fontWeight: 'bold',
  },
  xText: {
    color: COLORS.player1,
  },
  oText: {
    color: COLORS.player2,
  },
  winningText: {
    color: COLORS.textPrimary,
  },
});
