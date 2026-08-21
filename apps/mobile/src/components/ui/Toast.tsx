import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from './Text';
import { colors, spacing, typography } from '../../theme';

export function Toast({ message }: { message: string }) {
  return (
    <View style={styles.toast}>
      <View style={styles.icon}>
        <Check size={13} color={colors.white} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    minHeight: 48,
    backgroundColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 9,
    zIndex: 100
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success
  },
  text: {
    ...typography.caption,
    color: colors.white,
    flex: 1
  }
});