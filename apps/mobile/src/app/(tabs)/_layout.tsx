import { Tabs } from 'expo-router';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react-native';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          elevation: 0
        },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 6 },
        tabBarItemStyle: { paddingVertical: 2 }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={20} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color }) => <Search size={20} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarIcon: ({ color }) => <Heart size={20} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={20} color={color} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
