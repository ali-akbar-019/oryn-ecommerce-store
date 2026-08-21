import { StyleSheet, View, Switch } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingScrollView } from '@/components/ui/KeyboardAvoidingScrollView';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const preferences = useNotificationStore((s) => s.preferences);
  const hydrate = useNotificationStore((s) => s.hydrate);
  const save = useNotificationStore((s) => s.savePreferences);

  useEffect(() => {
    hydrate().catch(() => undefined);
  }, [hydrate]);

  const current = preferences ?? {
    orderUpdates: true,
    promotions: false,
    productAlerts: true
  };

  const update = (key: keyof typeof current, value: boolean) => {
    save({ ...current, [key]: value });
  };

  return (
    <KeyboardAvoidingScrollView>
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        {/* Back Button */}
        <Text style={styles.back} onPress={() => router.back()}>
          ‹ Back
        </Text>

        {/* Header */}
        <Text style={styles.kicker}>PREFERENCES</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.intro}>
          Choose what ORYN can send you and how the app behaves.
        </Text>

        {/* Settings Group */}
        <View style={styles.group}>
          <Setting
            label="Order updates"
            copy="Shipping, delivery and return notifications"
            value={current.orderUpdates}
            onChange={(v) => update('orderUpdates', v)}
          />
          <Setting
            label="Editorial updates"
            copy="New collections, stories and launches"
            value={current.promotions}
            onChange={(v) => update('promotions', v)}
          />
          <Setting
            label="Product alerts"
            copy="Price drops and back-in-stock updates"
            value={current.productAlerts}
            onChange={(v) => update('productAlerts', v)}
          />
        </View>

        {/* Regional Section */}
        <Text style={styles.section}>REGIONAL</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Currency</Text>
          <Text style={styles.value}>USD</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>English</Text>
        </View>
      </View>
    </KeyboardAvoidingScrollView>
  );
}

function Setting({
  label,
  copy,
  value,
  onChange
}: {
  label: string;
  copy: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.copy}>{copy}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderStrong, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
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
    fontSize: 34,
    lineHeight: 40,
    marginTop: 4
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: spacing.xxl
  },
  group: {
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  setting: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  settingText: {
    flex: 1,
    paddingRight: 12
  },
  label: {
    ...typography.body,
    fontWeight: '600'
  },
  copy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    maxWidth: 270
  },
  section: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: spacing.xxxl,
    marginBottom: spacing.sm
  },
  row: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value: {
    ...typography.body,
    color: colors.textSecondary
  }
});