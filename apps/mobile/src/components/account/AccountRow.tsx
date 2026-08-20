import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';

type Props = { label: string; detail?: string; icon: React.ReactNode; onPress: () => void; destructive?: boolean };

export function AccountRow({ label, detail, icon, onPress, destructive }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.icon, destructive && styles.destructiveIcon]}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.7} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { opacity: 0.58 },
  icon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  destructiveIcon: { backgroundColor: '#F4E8E6' },
  copy: { flex: 1, marginLeft: spacing.md },
  label: { ...typography.body, fontSize: 15 },
  detail: { ...typography.caption, marginTop: 3 },
  destructive: { color: colors.danger },
});
