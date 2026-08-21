import { StyleSheet, View, Pressable } from 'react-native';
import { colors, spacing } from '@/theme';
import { Text } from './Text';

interface ErrorStateProps { title?: string; description?: string; message?: string; onRetry?: () => void; }
export function ErrorState({ title = 'Something went wrong', description, message, onRetry }: ErrorStateProps) { const copy = description ?? message ?? 'Please try again.'; return <View style={styles.container}><Text variant="h3">{title}</Text><Text variant="body" color={colors.textSecondary} style={styles.description}>{copy}</Text>{onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text variant="bodyMedium" color={colors.accent}>Try again</Text></Pressable> : null}</View>; }
const styles = StyleSheet.create({ container: { alignItems: 'center', padding: spacing.xxxl }, description: { marginTop: spacing.sm, textAlign: 'center' }, retry: { marginTop: spacing.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg } });
