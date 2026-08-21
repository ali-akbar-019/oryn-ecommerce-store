import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, Keyboard } from 'react-native';
import { MapPin, Plus, Trash2, Check, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { addressApi, type Address } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingScrollView } from '@/components/ui/KeyboardAvoidingScrollView';

const emptyAddress = {
  label: 'Home',
  firstName: '',
  lastName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
  phone: '',
  isDefault: true
};

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      setError(null);
      const addresses = await addressApi.list();
      setItems(addresses);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load addresses.');
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const handleFieldChange = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveAddress = async () => {
    if (!form.firstName || !form.lastName || !form.line1 || !form.city || !form.postalCode) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await addressApi.create(form);
      setForm(emptyAddress);
      setShowForm(false);
      await loadAddresses();
      setError(null);
      Keyboard.dismiss();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save address.');
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (id: string) => {
    Alert.alert(
      'Remove address',
      'This delivery address will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await addressApi.remove(id);
            await loadAddresses();
          }
        }
      ]
    );
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setForm(emptyAddress);
      setError(null);
    }
  };

  return (
    <KeyboardAvoidingScrollView>
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>DELIVERY</Text>
            <Text style={styles.title}>Addresses</Text>
          </View>
          <Pressable style={styles.addButton} onPress={toggleForm}>
            <Plus size={18} color={colors.text} />
          </Pressable>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Address List */}
        {items.map((address) => (
          <View key={address.id} style={styles.addressItem}>
            <View style={styles.addressIcon}>
              <MapPin size={18} color={colors.accent} />
            </View>
            <View style={styles.addressContent}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {address.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Check size={11} color={colors.accent} />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.addressDetails}>
                {address.firstName} {address.lastName}
                {'\n'}{address.line1}
                {address.line2 ? `\n${address.line2}` : ''}
                {'\n'}{address.city}
                {address.state ? `, ${address.state}` : ''} {address.postalCode}
                {'\n'}{address.country} · {address.phone}
              </Text>
              <Pressable onPress={() => removeAddress(address.id)} style={styles.removeButton}>
                <Trash2 size={15} color={colors.danger} />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {!items.length && !showForm ? (
          <View style={styles.emptyState}>
            <MapPin size={22} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add a delivery address once and reuse it at checkout.
            </Text>
          </View>
        ) : null}

        {/* Add Address Form */}
        {showForm ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>New delivery address</Text>

            <Input
              label="Label"
              value={form.label}
              onChangeText={handleFieldChange('label')}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="First name"
                  value={form.firstName}
                  onChangeText={handleFieldChange('firstName')}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Last name"
                  value={form.lastName}
                  onChangeText={handleFieldChange('lastName')}
                />
              </View>
            </View>

            <Input
              label="Address"
              value={form.line1}
              onChangeText={handleFieldChange('line1')}
            />

            <Input
              label="Apartment / suite"
              value={form.line2}
              onChangeText={handleFieldChange('line2')}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="City"
                  value={form.city}
                  onChangeText={handleFieldChange('city')}
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Postal code"
                  value={form.postalCode}
                  onChangeText={handleFieldChange('postalCode')}
                />
              </View>
            </View>

            <Input
              label="State / province"
              value={form.state}
              onChangeText={handleFieldChange('state')}
            />

            <Input
              label="Country"
              value={form.country}
              onChangeText={handleFieldChange('country')}
            />

            <Input
              label="Phone"
              value={form.phone}
              onChangeText={handleFieldChange('phone')}
              keyboardType="phone-pad"
            />

            <Button
              label={loading ? 'Saving…' : 'Save address'}
              loading={loading}
              disabled={loading}
              onPress={saveAddress}
              style={styles.saveButton}
            />
          </View>
        ) : null}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xxxl
  },
  backText: {
    ...typography.body,
    color: colors.text
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md
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
  addButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  errorContainer: {
    marginTop: spacing.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
    borderRadius: 4
  },
  errorText: {
    ...typography.caption,
    color: colors.danger
  },
  addressItem: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    flexDirection: 'row'
  },
  addressIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginRight: 14
  },
  addressContent: {
    flex: 1
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  addressLabel: {
    ...typography.body,
    fontWeight: '600'
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  defaultText: {
    ...typography.caption,
    color: colors.accent
  },
  addressDetails: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 21
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12
  },
  removeText: {
    ...typography.caption,
    color: colors.danger
  },
  emptyState: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 30,
    marginTop: spacing.xl,
    alignItems: 'center'
  },
  emptyTitle: {
    ...typography.bodyMedium,
    marginTop: 10
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280
  },
  formContainer: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
    paddingBottom: 100
  },
  formTitle: {
    ...typography.h3,
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  half: {
    flex: 1
  },
  saveButton: {
    marginTop: 10
  }
});