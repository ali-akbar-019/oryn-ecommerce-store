import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from './Text';

interface EmptyStateProps { title: string; description?: string; }
export function EmptyState({ title, description }: EmptyStateProps) { return <View style={styles.container}><Text variant="h3" style={styles.title}>{title}</Text>{description ? <Text variant="body" color={colors.textSecondary} style={styles.description}>{description}</Text> : null}</View>; }
const styles = StyleSheet.create({ container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl }, title: { textAlign: 'center' }, description: { textAlign: 'center', marginTop: spacing.sm, maxWidth: 300, ...typography.body } });
