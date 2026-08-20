import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
export default function ProfileScreen() { return <View style={styles.container}><Text style={styles.title}>Profile</Text><Text style={styles.body}>Sign in to manage your account, orders and preferences.</Text></View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxxl }, title: { ...typography.h1, color: colors.text }, body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md } });
