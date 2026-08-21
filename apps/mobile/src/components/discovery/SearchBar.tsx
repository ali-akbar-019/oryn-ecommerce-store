import { Pressable, StyleSheet, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function SearchBar({
  value,
  onPress,
  onFilter
}: {
  value?: string;
  onPress?: () => void;
  onFilter?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPress} style={styles.search}>
        <Search size={18} color={colors.textMuted} strokeWidth={1.7} />
        <Text style={styles.placeholder}>
          {value || 'Search the collection'}
        </Text>
      </Pressable>

      {onFilter ? (
        <Pressable onPress={onFilter} style={styles.filter}>
          <SlidersHorizontal size={18} color={colors.text} strokeWidth={1.7} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  search: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10
  },
  placeholder: {
    ...typography.body,
    color: colors.textMuted
  },
  filter: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  }
});