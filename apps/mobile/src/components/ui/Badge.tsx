import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@/theme';
import { Text } from './Text';

interface BadgeProps {
    label: string;
    tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
    return (
        <View style={[styles.base, styles[tone]]}>
            <Text
                variant="caption"
                color={tone === 'neutral' ? colors.textSecondary : colors.text}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderWidth: 1,
        borderRadius: radii.sm
    },
    neutral: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border
    },
    success: {
        backgroundColor: '#E9F2EC',
        borderColor: '#C4DCCB'
    },
    warning: {
        backgroundColor: '#F4EBDD',
        borderColor: '#E1CBA8'
    },
    danger: {
        backgroundColor: '#F7E7E5',
        borderColor: '#E5C3BF'
    }
});