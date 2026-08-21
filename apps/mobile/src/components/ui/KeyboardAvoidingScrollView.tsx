// components/ui/KeyboardAvoidingScrollView.tsx
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

export function KeyboardAvoidingScrollView({ children, style }: { children: ReactNode; style?: any }) {
    return (
        <KeyboardAvoidingView
            style={[styles.flex, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    style={styles.flex}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    bottomPadding: { height: Platform.OS === 'ios' ? 80 : 40 }
});