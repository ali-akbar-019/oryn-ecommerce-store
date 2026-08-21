import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ArrowUpDown, Check } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/theme';
import { Text } from '@/components/ui';

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to high' },
  { value: 'price-desc', label: 'Price: High to low' },
];

export function SortFilterBar({ count, sort, onChangeSort }: { count: number; sort: SortOption; onChangeSort: (value: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const activeLabel = OPTIONS.find((option) => option.value === sort)?.label ?? 'Newest';
  return (
    <View style={styles.meta}>
      <Text style={styles.count}>{count} {count === 1 ? 'piece' : 'pieces'}</Text>
      <Pressable style={styles.sortButton} onPress={() => setOpen(true)}>
        <Text style={styles.sortLabel}>{activeLabel}</Text>
        <ArrowUpDown size={13} color={colors.textSecondary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            {OPTIONS.map((option) => (
              <Pressable key={option.value} style={styles.option} onPress={() => { onChangeSort(option.value); setOpen(false); }}>
                <Text style={option.value === sort ? styles.optionTextActive : styles.optionText}>{option.label}</Text>
                {option.value === sort ? <Check size={16} color={colors.accent} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 22 },
  count: { ...typography.caption, color: colors.textSecondary },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortLabel: { ...typography.caption, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,17,16,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.xl, paddingBottom: spacing.xxl },
  sheetTitle: { ...typography.h3, marginBottom: spacing.lg },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border },
  optionText: { ...typography.body, color: colors.textSecondary },
  optionTextActive: { ...typography.bodyMedium, color: colors.text },
});
