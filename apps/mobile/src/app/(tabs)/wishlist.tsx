import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
export default function WishlistScreen() { return <View style={styles.container}><Text style={styles.title}>Wishlist</Text><Text style={styles.body}>Your saved products will appear here.</Text></View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxxl }, title: { ...typography.h1, color: colors.text }, body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md } });
