import { CheckCheck, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { IconButton, Text } from '@/components/ui';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const items = useNotificationStore((state) => state.items);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const hydrate = useNotificationStore((state) => state.hydrate);
  const loading = useNotificationStore((state) => state.loading);
  const unread = useNotificationStore((state) => state.unread);

  useEffect(() => {
    hydrate().catch(() => undefined);
  }, [hydrate]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.eyebrow}>ORYN / ACCOUNT</Text>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <IconButton
          icon={X}
          accessibilityLabel="Close notifications"
          onPress={() => router.back()}
        />
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {unread ? `${unread} unread` : 'All caught up'}
        </Text>
        {unread ? (
          <Pressable onPress={markAllRead} style={styles.readAll}>
            <CheckCheck size={15} color={colors.text} />
            <Text style={styles.readAllText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading && !items.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Loading updates…</Text>
          </View>
        ) : items.length ? (
          items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={() => {
                markRead(item.id);
                if (item.deepLink) {
                  router.push(item.deepLink as never);
                }
              }}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing new.</Text>
            <Text style={styles.emptyBody}>
              Order updates and carefully selected ORYN notes will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4
  },
  title: {
    ...typography.h1,
    marginTop: 5
  },
  toolbar: {
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary
  },
  readAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  readAllText: {
    ...typography.caption,
    color: colors.text
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 50
  },
  empty: {
    paddingTop: 90,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyTitle: {
    ...typography.h2
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 310
  }
});