import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

type Item = { name: string; slug: string };
export function CategoryFilter({ value, onChange, items = [{ name: 'All', slug: 'all' }] }: { value: string; onChange: (value: string) => void; items?: Item[] }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
    {items.map((item) => { const active = item.slug === value; return <Pressable key={item.slug} onPress={() => onChange(item.slug)} style={[styles.item, active && styles.active]}><Text style={[styles.label, active && styles.activeLabel]}>{item.name}</Text></Pressable>; })}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { gap: 8, paddingRight: spacing.xl }, item: { paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }, active: { backgroundColor: colors.text, borderColor: colors.text }, label: { ...typography.caption, color: colors.textSecondary }, activeLabel: { color: colors.white } });
