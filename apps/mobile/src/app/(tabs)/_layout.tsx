import { Redirect, Tabs } from 'expo-router';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react-native';
import { colors, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useEffect } from 'react';

export default function TabsLayout() {
  const { hydrated, user } = useAuthStore();
  const hydrateCart = useCartStore((state) => state.hydrate);

  useEffect(() => {
    if (hydrated && user) {
      void hydrateCart();
    }
  }, [hydrated, user, hydrateCart]);

  if (hydrated && !user) {
    return <Redirect href="/(auth)/login" />;
  }

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
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={21}
              color={color}
              strokeWidth={focused ? 2.1 : 1.6}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Search
              size={21}
              color={color}
              strokeWidth={focused ? 2.1 : 1.6}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <Heart
              size={21}
              color={color}
              strokeWidth={focused ? 2.1 : 1.6}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag
              size={21}
              color={color}
              strokeWidth={focused ? 2.1 : 1.6}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={21}
              color={color}
              strokeWidth={focused ? 2.1 : 1.6}
            />
          ),
        }}
      />
    </Tabs>
  );
}