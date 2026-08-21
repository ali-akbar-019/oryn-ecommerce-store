import { ScrollView, StyleSheet, View, Pressable, RefreshControl } from 'react-native';
import { ArrowLeft, Check, Clock3, MapPin, Package, Truck, XCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, spacing, typography } from '@/theme';
import { useOrder, type OrderStatus } from '@/hooks/useOrders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const statusLabel = (status: string) =>
  status.replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const formatMoney = (value: string | number, currency: string) =>
  `${currency} ${Number(value).toFixed(2)}`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));

const TRACKING_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

function stepIcon(status: OrderStatus, active: boolean, completed: boolean) {
  const color = active || completed ? colors.accent : colors.textMuted;

  if (status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY') {
    return <Truck size={18} color={color} />;
  }
  if (status === 'DELIVERED') {
    return <Check size={18} color={color} />;
  }
  if (status === 'PROCESSING') {
    return <Package size={18} color={color} />;
  }
  return <Clock3 size={18} color={color} />;
}

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);

  if (order.isLoading) return <Loader />;
  if (order.isError || !order.data) {
    return (
      <ErrorState
        title="Order unavailable"
        description="We couldn't load this order. Please try again."
      />
    );
  }

  const data = order.data;
  const currentIndex = TRACKING_STEPS.indexOf(data.status);
  const cancelled = data.status === 'CANCELLED' || data.status === 'RETURNED';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
      refreshControl={
        <RefreshControl
          refreshing={order.isRefetching}
          onRefresh={() => void order.refetch()}
          tintColor={colors.accent}
        />
      }
    >
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={18} color={colors.text} />
        <Text style={styles.backText}>Orders</Text>
      </Pressable>

      {/* Order Header */}
      <Text style={styles.eyebrow}>ORDER</Text>
      <Text style={styles.title}>ORYN-{data.id.slice(-8).toUpperCase()}</Text>
      <Text style={styles.date}>Placed {formatDate(data.createdAt)}</Text>

      {/* Order Status Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Package size={22} color={colors.accent} />
        </View>
        <View style={styles.heroMain}>
          <Text style={styles.heroStatus}>{statusLabel(data.status)}</Text>
          <Text style={styles.heroCopy}>
            {data.paymentStatus === 'PAID' ? 'Payment confirmed' : 'Payment pending'}
          </Text>
        </View>
      </View>

      {/* Tracking Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TRACKING</Text>
        <View style={styles.timeline}>
          {cancelled ? (
            <View style={styles.cancelled}>
              <XCircle size={20} color={colors.danger} />
              <View style={styles.timelineText}>
                <Text style={styles.stepTitle}>{statusLabel(data.status)}</Text>
                <Text style={styles.stepCopy}>
                  {data.statusHistory.at(-1)?.note ??
                    'This order is no longer moving through delivery.'}
                </Text>
              </View>
            </View>
          ) : (
            TRACKING_STEPS.map((step, index) => {
              const completed = currentIndex >= index;
              const active = currentIndex === index;
              const history = data.statusHistory.find(entry => entry.status === step);

              return (
                <View key={step} style={styles.step}>
                  <View style={[styles.stepIcon, completed && styles.stepIconActive]}>
                    {stepIcon(step, active, completed)}
                  </View>
                  <View style={styles.timelineText}>
                    <Text style={[styles.stepTitle, completed && styles.stepTitleActive]}>
                      {statusLabel(step)}
                    </Text>
                    <Text style={styles.stepCopy}>
                      {history?.note ??
                        (active ? 'We are processing this stage of your order.' : 'Coming next')}
                    </Text>
                    {history ? (
                      <Text style={styles.stepDate}>{formatDate(history.createdAt)}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Items List */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ITEMS</Text>
        {data.items.map(item => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemIcon}>
              <Package size={18} color={colors.textMuted} />
            </View>
            <View style={styles.itemMain}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {formatMoney(item.lineTotal, data.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Delivery Address */}
      {data.address ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
            <MapPin size={16} color={colors.textMuted} />
          </View>
          <Text style={styles.addressName}>
            {data.address.firstName} {data.address.lastName}
          </Text>
          <Text style={styles.address}>
            {data.address.line1}
            {data.address.line2 ? `\n${data.address.line2}` : ''}
            \n{data.address.city}
            {data.address.state ? `, ${data.address.state}` : ''} {data.address.postalCode}
            \n{data.address.country}
          </Text>
        </View>
      ) : null}

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUMMARY</Text>
        <View style={styles.row}>
          <Text style={styles.muted}>Subtotal</Text>
          <Text>{formatMoney(data.subtotal, data.currency)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.muted}>Shipping</Text>
          <Text>{formatMoney(data.shippingTotal, data.currency)}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatMoney(data.total, data.currency)}
          </Text>
        </View>
      </View>

      <Button
        label="Continue shopping"
        variant="secondary"
        onPress={() => router.replace('/shop')}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxxl
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: spacing.xl
  },
  backText: {
    ...typography.bodyMedium
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5
  },
  title: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    marginTop: 7
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 7
  },
  hero: {
    marginTop: spacing.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroIcon: {
    width: 46,
    height: 46,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroMain: {
    marginLeft: 14
  },
  heroStatus: {
    ...typography.bodyMedium
  },
  heroCopy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4
  },
  section: {
    marginTop: spacing.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 18
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginBottom: 14
  },
  timeline: {
    paddingLeft: 2
  },
  step: {
    flexDirection: 'row',
    minHeight: 76
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepIconActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  timelineText: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 12
  },
  stepTitle: {
    ...typography.bodyMedium,
    color: colors.textMuted
  },
  stepTitleActive: {
    color: colors.text
  },
  stepCopy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18
  },
  stepDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4
  },
  cancelled: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  cancelledText: {
    flex: 1,
    paddingLeft: 14
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  itemIcon: {
    width: 42,
    height: 42,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemMain: {
    flex: 1,
    paddingHorizontal: 12
  },
  itemName: {
    ...typography.bodyMedium
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3
  },
  itemPrice: {
    ...typography.bodyMedium
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addressName: {
    ...typography.bodyMedium
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7
  },
  muted: {
    color: colors.textSecondary
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    paddingTop: 14
  },
  totalLabel: {
    ...typography.bodyMedium
  },
  totalValue: {
    ...typography.bodyMedium
  },
  button: {
    marginTop: spacing.xxl
  }
});