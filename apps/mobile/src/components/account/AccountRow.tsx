import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function AccountRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  destructive = false
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.icon, destructive && styles.iconDanger]}>
        <Icon
          size={18}
          color={destructive ? colors.danger : colors.text}
          strokeWidth={1.7}
        />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, destructive && styles.danger]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {!destructive ? (
        <ChevronRight size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  pressed: {
    opacity: 0.65
  },
  icon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  iconDanger: {
    borderColor: '#E5C8C5',
    backgroundColor: '#FAF0EE'
  },
  copy: {
    flex: 1
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text
  },
  danger: {
    color: colors.danger
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2
  }
});