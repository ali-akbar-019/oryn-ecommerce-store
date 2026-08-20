import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function ShopScreen() {
  return <View style={styles.container}><Text style={styles.title}>Shop</Text><Text style={styles.body}>Product discovery will be connected to the catalog API in the next implementation step.</Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxxl }, title: { ...typography.h1, color: colors.text }, body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md } });
