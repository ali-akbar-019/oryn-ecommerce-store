import { Stack } from 'expo-router';
import { colors, typography } from '@/theme';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background
        },
        headerTintColor: colors.text,
        headerTitleStyle: typography.h3,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}
    />
  );
}