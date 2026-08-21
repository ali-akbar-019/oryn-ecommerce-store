import { StyleSheet, View, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useChangePassword } from '@/hooks/useAccount';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingScrollView } from '@/components/ui/KeyboardAvoidingScrollView';

export default function Security() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const mutation = useChangePassword();

  const submit = async () => {
    setError('');
    try {
      await mutation.mutateAsync({
        currentPassword: current,
        newPassword: password
      });
      setDone(true);
      setCurrent('');
      setPassword('');
      Keyboard.dismiss();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update password.');
    }
  };

  return (
    <KeyboardAvoidingScrollView>
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        {/* Back Button */}
        <Text style={styles.back} onPress={() => router.back()}>
          ‹ Back
        </Text>

        {/* Header */}
        <Text style={styles.kicker}>SECURITY</Text>
        <Text style={styles.title}>Keep your account protected.</Text>
        <Text style={styles.intro}>
          Change your password without leaving your ORYN account.
        </Text>

        {/* Form */}
        <Input
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          placeholder="Your current password"
        />

        <Input
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          style={styles.input}
        />

        {/* Error */}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {/* Success */}
        {done ? (
          <Text style={styles.success}>Password updated successfully.</Text>
        ) : null}

        {/* Submit Button */}
        <Button
          label={mutation.isPending ? 'Updating…' : 'Update password'}
          onPress={submit}
          disabled={current.length < 8 || password.length < 8 || mutation.isPending}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingBottom: 50
  },
  back: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.xxxl
  },
  kicker: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5
  },
  title: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    marginTop: spacing.md
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: spacing.xxl
  },
  input: {
    marginTop: spacing.lg
  },
  button: {
    marginTop: spacing.xl
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 14
  },
  success: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 14
  }
});