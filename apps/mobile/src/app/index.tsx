import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { hydrated, user } = useAuthStore();
  if (!hydrated) return <View style={styles.container}><ActivityIndicator color={colors.accent} /></View>;
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' } });
