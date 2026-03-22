import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Player } from '../../types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  player1Name: string;
  player2Name: string;
}

export function TurnIndicator({
  currentPlayer,
  player1Name,
  player2Name,
}: TurnIndicatorProps) {
  const opacity = useSharedValue(1);
  const playerColor = currentPlayer === 1 ? COLORS.player1 : COLORS.player2;
  const playerName = currentPlayer === 1 ? player1Name : player2Name;

  React.useEffect(() => {
    opacity.value = 0;
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 200 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [currentPlayer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: playerColor },
        animatedStyle,
      ]}
    >
      <Text style={styles.text}>{playerName}'s Turn</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
