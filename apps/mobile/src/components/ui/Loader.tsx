import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';

export function Loader() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="small" color={colors.accent} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center'
    }
});