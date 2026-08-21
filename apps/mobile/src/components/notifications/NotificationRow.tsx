import { Bell, Box, Heart, LockKeyhole, Megaphone, Truck } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';
import type { AppNotification } from '@/store/notificationStore';

const icons: Record<string, typeof Bell> = {
  ORDER_UPDATE: Box,
  DELIVERY: Truck,
  PROMOTION: Megaphone,
  WISHLIST: Heart,
  SECURITY: LockKeyhole
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return new Date(iso).toLocaleDateString();
}

export function NotificationRow({
  item,
  onPress
}: {
  item: AppNotification;
  onPress?: () => void;
}) {
  const Icon = icons[item.type] ?? Bell;
  const unread = !item.readAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.unread,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.icon}>
        <Icon size={18} color={colors.text} strokeWidth={1.7} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleLine}>
          <Text style={styles.title}>{item.title}</Text>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  unread: {
    backgroundColor: '#F4F6F3'
  },
  pressed: {
    opacity: 0.7
  },
  icon: {
    width: 38,
    height: 38,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  copy: {
    flex: 1,
    paddingRight: spacing.md
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent
  }
});