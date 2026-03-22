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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const translateY = useSharedValue(300);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
    } else {
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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
        <Text style={styles.menuButtonText}>RESUME</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={onRestart}>
        <Text style={styles.menuButtonText}>RESTART</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={onGoHome}>
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
    <Modal visible={visible} onClose={() => {}} title="">
      <View style={styles.gameOverContent}>
        <Text style={styles.trophy}>{isDraw ? '🤝' : '🏆'}</Text>
        <Text style={styles.winnerText}>
          {isDraw ? "It's a Draw!" : `${winner} Wins!`}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
          <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onGoHome}>
          <Text style={styles.secondaryButtonText}>GO TO HOME</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '80%',
    maxWidth: 320,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  content: {
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
    width: '100%',
  },
  menuButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameOverContent: {
    alignItems: 'center',
    width: '100%',
  },
  trophy: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  winnerText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
    width: '100%',
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
    marginVertical: SPACING.sm,
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
