import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

type Props = { title: string; action?: string; onPress?: () => void };

export function SectionHeader({ title, action = 'View all', onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <Pressable onPress={onPress} style={styles.action} hitSlop={8}>
          <Text style={styles.actionText}>{action}</Text>
          <ChevronRight size={15} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
});
