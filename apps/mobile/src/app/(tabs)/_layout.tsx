import { Tabs } from 'expo-router';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react-native';
import { colors, typography } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 9,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          elevation: 0,
        },
        tabBarLabelStyle: { ...typography.caption, fontSize: 10, marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <Home size={21} color={color} strokeWidth={focused ? 2.1 : 1.6} /> }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color, focused }) => <Search size={21} color={color} strokeWidth={focused ? 2.1 : 1.6} /> }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarIcon: ({ color, focused }) => <Heart size={21} color={color} strokeWidth={focused ? 2.1 : 1.6} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ color, focused }) => <ShoppingBag size={21} color={color} strokeWidth={focused ? 2.1 : 1.6} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <User size={21} color={color} strokeWidth={focused ? 2.1 : 1.6} /> }} />
    </Tabs>
  );
}
