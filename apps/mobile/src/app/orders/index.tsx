import { ScrollView, StyleSheet, View, Pressable, RefreshControl } from 'react-native';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loader } from '@/components/ui/Loader';
import { colors, spacing, typography } from '@/theme';
import { useOrders } from '@/hooks/useOrders';

const statusLabel = (status: string) => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const formatMoney = (value: string | number, currency: string) => `${currency} ${Number(value).toFixed(2)}`;
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export default function OrdersScreen() {
  const orders = useOrders();
  if (orders.isLoading) return <Loader />;
  if (orders.isError) return <ErrorState title="Orders unavailable" description="We couldn't load your orders. Please try again." />;
  const items = orders.data ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} tintColor={colors.accent} />}
    >
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.title}>Orders</Text>
      {items.length === 0 ? (
        <EmptyState title="No orders yet" description="Your completed purchases will appear here." />
      ) : items.map(order => (
        <Pressable key={order.id} style={({ pressed }) => [styles.order, pressed && styles.pressed]} onPress={() => router.push(`/orders/${order.id}`)}>
          <View style={styles.icon}><Package size={20} color={colors.text} /></View>
          <View style={styles.main}>
            <Text style={styles.number}>ORYN-{order.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.meta}>{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</Text>
            <View style={styles.statusRow}><Text style={styles.status}>{statusLabel(order.status)}</Text><Text style={styles.total}>{formatMoney(order.total, order.currency)}</Text></View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      ))}
      <View style={styles.footer}><ShoppingBag size={16} color={colors.textMuted} /><Text style={styles.footerText}>Orders are kept securely in your ORYN account.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:{padding:spacing.xl,paddingTop:spacing.xxxl,backgroundColor:colors.background,flexGrow:1},
  eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},
  title:{...typography.display,fontSize:34,lineHeight:40,marginTop:7,marginBottom:spacing.xxl},
  order:{borderTopWidth:1,borderColor:colors.border,paddingVertical:18,flexDirection:'row',alignItems:'center'},
  pressed:{opacity:0.65},
  icon:{width:46,height:46,backgroundColor:colors.surfaceMuted,alignItems:'center',justifyContent:'center'},
  main:{flex:1,paddingHorizontal:14},
  number:{...typography.bodyMedium},
  meta:{...typography.caption,color:colors.textSecondary,marginTop:4},
  statusRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:7},
  status:{...typography.caption,color:colors.accent},
  total:{...typography.caption,color:colors.text,fontWeight:'600'},
  footer:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:spacing.xxxl},
  footerText:{...typography.caption,color:colors.textMuted},
});
