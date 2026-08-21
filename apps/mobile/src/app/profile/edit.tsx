import { useState } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingScrollView } from '@/components/ui/KeyboardAvoidingScrollView';

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setError('');

    try {
      const updated = await api.patch<typeof user>('/auth/me', { firstName, lastName });
      if (updated) setUser(updated);
      Keyboard.dismiss();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save changes.');
    } finally {
      setSaving(false);
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
        <Text style={styles.kicker}>PROFILE</Text>
        <Text style={styles.title}>Personal information</Text>
        <Text style={styles.intro}>
          Keep your details current for a smoother checkout experience.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
          />
        </View>

        {/* Error */}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {/* Save Button */}
        <Button
          label={saving ? 'Saving…' : 'Save changes'}
          onPress={save}
          disabled={!firstName.trim() || !lastName.trim() || saving}
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
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.lg
  }
});