import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { Text } from './Text';

interface ErrorStateProps { title?: string; description?: string; }
export function ErrorState({ title = 'Something went wrong', description = 'Please try again.' }: ErrorStateProps) { return <View style={styles.container}><Text variant="h3">{title}</Text><Text variant="body" color={colors.textSecondary} style={styles.description}>{description}</Text></View>; }
const styles = StyleSheet.create({ container: { alignItems: 'center', padding: spacing.xxxl }, description: { marginTop: spacing.sm, textAlign: 'center' } });
