import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MapPin, CreditCard, Truck, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing, typography } from '@/theme';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutScreen() {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}><Text style={styles.eyebrow}>SECURE CHECKOUT</Text><Text style={styles.title}>Complete your order.</Text><Text style={styles.copy}>A simple, considered checkout with your order details kept clear at every step.</Text></View>
      <Section icon={MapPin} title="Delivery address" detail="Add your delivery address" onPress={() => {}} />
      <Section icon={Truck} title="Delivery method" detail="Standard delivery · 3–5 days" onPress={() => {}} />
      <Section icon={CreditCard} title="Payment" detail="Mock payment · ready for testing" onPress={() => {}} />
      <View style={styles.summary}><Text style={styles.summaryTitle}>Order summary</Text>{items.map((item) => <View key={item.key} style={styles.line}><View style={styles.lineText}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemMeta}>{item.quantity} × ${item.price}</Text></View><Text style={styles.amount}>${(item.price * item.quantity).toFixed(2)}</Text></View>)}<View style={styles.divider}/><Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} /><Row label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} /><Row label="Total" value={`$${total.toFixed(2)}`} strong /></View>
      <Button label="Place order" onPress={() => router.push('/checkout/confirmation')} style={styles.cta} />
      <Text style={styles.note}>By placing this order, you agree to ORYN's terms and return policy.</Text>
    </ScrollView>
  );
}
function Section({ icon: Icon, title, detail, onPress }: any) { return <View style={styles.section}><Icon size={19} color={colors.text}/><View style={styles.sectionText}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionDetail}>{detail}</Text></View><ChevronRight size={18} color={colors.textMuted}/></View>; }
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <View style={styles.row}><Text style={strong ? styles.totalLabel : styles.label}>{label}</Text><Text style={strong ? styles.totalValue : styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ content:{padding:spacing.xl,paddingBottom:48},intro:{paddingTop:spacing.lg,paddingBottom:spacing.xxl},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},title:{...typography.display,fontSize:32,lineHeight:38,marginTop:8},copy:{...typography.body,color:colors.textSecondary,lineHeight:23,marginTop:12,maxWidth:340},section:{minHeight:76,borderTopWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',gap:14},sectionText:{flex:1},sectionTitle:{...typography.bodyMedium},sectionDetail:{...typography.caption,color:colors.textSecondary,marginTop:4},summary:{marginTop:spacing.xxl,borderTopWidth:1,borderBottomWidth:1,borderColor:colors.border,paddingVertical:spacing.lg},summaryTitle:{...typography.h3,marginBottom:spacing.lg},line:{flexDirection:'row',justifyContent:'space-between',marginBottom:14},lineText:{flex:1,paddingRight:12},itemName:{...typography.bodyMedium},itemMeta:{...typography.caption,color:colors.textMuted,marginTop:3},amount:{...typography.bodyMedium},divider:{height:1,backgroundColor:colors.border,marginVertical:6},row:{flexDirection:'row',justifyContent:'space-between',paddingVertical:7},label:{...typography.body,color:colors.textSecondary},value:{...typography.body},totalLabel:{...typography.bodyMedium},totalValue:{...typography.h3},cta:{marginTop:spacing.xl},note:{...typography.caption,color:colors.textMuted,textAlign:'center',marginTop:12,lineHeight:18}});
