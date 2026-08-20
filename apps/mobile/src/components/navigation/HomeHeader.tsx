import { Pressable, StyleSheet, View } from 'react-native';
import { Bell, Search, ShoppingBag } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function HomeHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>ORYN</Text>
        <Text style={styles.location}>CURATED / EVERYDAY</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.action}><Search size={20} color={colors.text} strokeWidth={1.65} /></Pressable>
        <Pressable style={styles.action}><Bell size={20} color={colors.text} strokeWidth={1.65} /></Pressable>
        <Pressable style={styles.action}><ShoppingBag size={20} color={colors.text} strokeWidth={1.65} /><View style={styles.dot} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  brand: { ...typography.h2, color: colors.text, letterSpacing: 3.2, fontWeight: '700' },
  location: { ...typography.caption, color: colors.textMuted, letterSpacing: 1.1, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  action: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 8, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
});
