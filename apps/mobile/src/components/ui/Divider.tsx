import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: colors.border,
        width: '100%'
    }
});