import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function CategoryFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {['All', 'Women', 'Men', 'Shoes', 'Watches', 'Accessories'].map((item) => {
        const active = item === value;
        return <Pressable key={item} onPress={() => onChange(item)} style={[styles.item, active && styles.active]}><Text style={[styles.label, active && styles.activeLabel]}>{item}</Text></Pressable>;
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { gap: 8, paddingRight: spacing.xl },
  item: { paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  active: { backgroundColor: colors.text, borderColor: colors.text },
  label: { ...typography.caption, color: colors.textSecondary },
  activeLabel: { color: colors.white },
});
