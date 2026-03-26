import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 200 });
    }, 50);
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
      <View style={styles.inner}>
        <MaterialCommunityIcons
          name="gamepad-variant"
          size={16}
          color={COLORS.background}
          style={styles.icon}
        />
        <Text style={styles.text}>{playerName}'s Turn</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
