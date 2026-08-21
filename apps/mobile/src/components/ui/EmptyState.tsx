import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from './Text';

interface EmptyStateProps {
    title: string;
    description?: string;
    message?: string;
}

export function EmptyState({ title, description, message }: EmptyStateProps) {
    const copy = description ?? message;

    return (
        <View style={styles.container}>
            <Text variant="h3" style={styles.title}>{title}</Text>
            {copy ? (
                <Text variant="body" color={colors.textSecondary} style={styles.description}>
                    {copy}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl
    },
    title: {
        textAlign: 'center'
    },
    description: {
        textAlign: 'center',
        marginTop: spacing.sm,
        maxWidth: 300,
        ...typography.body
    }
});