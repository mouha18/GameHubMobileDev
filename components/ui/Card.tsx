import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface CardProps {
  title: string;
  category: string;
  icon: string;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Card({ title, category, icon, onPress }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon as any}
          size={48}
          color={COLORS.textPrimary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.category}>{category}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
