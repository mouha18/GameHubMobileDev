import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(50, { duration: 150 });
      opacity.value = withTiming(0, { duration: 100 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.container, animatedStyle]}>
              <View style={styles.handle} />
              <Text style={styles.title}>{title}</Text>
              <View style={styles.content}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export function MenuModal({
  visible,
  onClose,
  onResume,
  onRestart,
  onGoHome,
}: MenuModalProps) {
  return (
    <Modal visible={visible} onClose={onClose} title="PAUSED">
      <TouchableOpacity style={styles.menuButton} onPress={onResume}>
        <MaterialCommunityIcons name="play" size={24} color={COLORS.textPrimary} />
        <Text style={styles.menuButtonText}>RESUME</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={onRestart}>
        <MaterialCommunityIcons name="restart" size={24} color={COLORS.textPrimary} />
        <Text style={styles.menuButtonText}>RESTART</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={onGoHome}>
        <MaterialCommunityIcons name="home" size={24} color={COLORS.textPrimary} />
        <Text style={styles.menuButtonText}>GO TO HOME</Text>
      </TouchableOpacity>
    </Modal>
  );
}

interface GameOverModalProps {
  visible: boolean;
  winner: string | null;
  isDraw: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function GameOverModal({
  visible,
  winner,
  isDraw,
  onPlayAgain,
  onGoHome,
}: GameOverModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        style={styles.overlay}
      >
        <View style={styles.gameOverContainer}>
          <Text style={styles.trophy}>{isDraw ? '🤝' : '🏆'}</Text>
          
          <Text style={styles.winnerText}>
            {isDraw ? "It's a Draw!" : `${winner} Wins!`}
          </Text>
          
          <View style={styles.gameOverButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
              <MaterialCommunityIcons name="replay" size={20} color={COLORS.textPrimary} />
              <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome}>
              <MaterialCommunityIcons name="home" size={20} color={COLORS.accent} />
              <Text style={styles.secondaryButtonText}>GO TO HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 2,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  menuButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  menuButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameOverContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  trophy: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  winnerText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  gameOverButtons: {
    width: '100%',
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
