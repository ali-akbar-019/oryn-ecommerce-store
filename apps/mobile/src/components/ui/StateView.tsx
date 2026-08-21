import { Pressable, StyleSheet, View } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Text } from './Text';
import { colors, spacing, typography } from '../../theme';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({
  title,
  description,
  actionLabel,
  onAction
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <AlertCircle size={18} color={colors.textSecondary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.action}
        >
          <RefreshCw size={14} color={colors.text} />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.sm
  },
  icon: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  title: {
    ...typography.h3,
    color: colors.text
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 13,
    height: 38,
    marginTop: spacing.sm
  },
  actionText: {
    ...typography.label,
    color: colors.text
  }
});