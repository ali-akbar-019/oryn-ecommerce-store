import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';
import { useCartStore } from '@/store/cartStore';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const loading = useCartStore((state) => state.loading);
  const error = useCartStore((state) => state.error);
  const update = useCartStore((state) => state.updateQuantity);
  const remove = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 12;
  const total = subtotal + shipping;

  if (!items.length) return <View style={styles.empty}><Text style={styles.eyebrow}>YOUR BAG</Text><Text style={styles.emptyTitle}>Nothing here yet.</Text><Text style={styles.emptyCopy}>Save something you love, then come back when you're ready.</Text><Button label="Explore the collection" onPress={() => router.push('/shop')} style={styles.emptyButton}/></View>;

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
    <View style={styles.heading}><View><Text style={styles.eyebrow}>YOUR BAG</Text><Text style={styles.title}>Cart</Text></View><Text style={styles.count}>{items.reduce((sum, item) => sum + item.quantity, 0)} items</Text></View>
    <View style={styles.items}>{items.map((item) => <View key={item.key} style={styles.item}><Image source={item.image} style={styles.image} contentFit="cover"/><View style={styles.itemInfo}><View style={styles.itemTop}><View style={styles.nameWrap}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{[item.color, item.size].filter(Boolean).join(' · ') || 'Selected piece'}</Text></View><Pressable onPress={() => remove(item.key)} hitSlop={10}><Trash2 size={17} color={colors.textMuted}/></Pressable></View><View style={styles.itemBottom}><Text style={styles.price}>${item.price.toFixed(2)}</Text><View style={styles.stepper}><Pressable onPress={() => update(item.key, item.quantity - 1)} style={styles.step}><Minus size={14} color={colors.text}/></Pressable><Text style={styles.qty}>{item.quantity}</Text><Pressable onPress={() => update(item.key, item.quantity + 1)} style={styles.step}><Plus size={14} color={colors.text}/></Pressable></View></View></View></View>)}</View>
    <View style={styles.summary}><Text style={styles.summaryTitle}>Summary</Text><Row label="Subtotal" value={`$${subtotal.toFixed(2)}`}/><Row label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}/><View style={styles.divider}/><Row label="Total" value={`$${total.toFixed(2)}`} strong/></View>
    <View style={styles.note}><ArrowRight size={16} color={colors.accent}/><Text style={styles.noteText}>{shipping === 0 ? 'Complimentary standard shipping included.' : 'Complimentary shipping on orders over $150.'}</Text></View>
    <Button label={loading ? 'Updating…' : 'Continue to checkout'} disabled={loading} onPress={() => router.push('/checkout')} style={styles.checkout}/>
  </ScrollView>;
}
function Row({label,value,strong}:{label:string;value:string;strong?:boolean}){return <View style={styles.row}><Text style={strong?styles.totalLabel:styles.label}>{label}</Text><Text style={strong?styles.totalValue:styles.value}>{value}</Text></View>}
const styles=StyleSheet.create({content:{padding:spacing.xl,paddingTop:spacing.xxxl,paddingBottom:48,backgroundColor:colors.background},heading:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',paddingBottom:spacing.xxl},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},title:{...typography.display,fontSize:34,lineHeight:40,marginTop:7},count:{...typography.caption,color:colors.textSecondary,paddingBottom:5},items:{borderTopWidth:1,borderColor:colors.border},item:{flexDirection:'row',paddingVertical:18,borderBottomWidth:1,borderColor:colors.border},image:{width:102,height:126,backgroundColor:colors.surfaceMuted},itemInfo:{flex:1,paddingLeft:14},itemTop:{flex:1,flexDirection:'row',justifyContent:'space-between'},nameWrap:{flex:1,paddingRight:8},name:{...typography.bodyMedium},meta:{...typography.caption,color:colors.textMuted,marginTop:5},itemBottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10},price:{...typography.bodyMedium},stepper:{height:36,borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center'},step:{width:34,height:34,alignItems:'center',justifyContent:'center'},qty:{...typography.caption,width:22,textAlign:'center'},summary:{marginTop:spacing.xxl,borderTopWidth:1,borderBottomWidth:1,borderColor:colors.border,paddingVertical:spacing.lg},summaryTitle:{...typography.h3,marginBottom:8},row:{flexDirection:'row',justifyContent:'space-between',paddingVertical:7},label:{...typography.body,color:colors.textSecondary},value:{...typography.body},totalLabel:{...typography.bodyMedium},totalValue:{...typography.h3},divider:{height:1,backgroundColor:colors.border,marginVertical:8},note:{flexDirection:'row',gap:9,alignItems:'center',paddingVertical:16},noteText:{...typography.caption,color:colors.textSecondary,flex:1},checkout:{marginTop:4},empty:{flex:1,backgroundColor:colors.background,padding:spacing.xl,paddingTop:spacing.huge,alignItems:'flex-start'},emptyTitle:{...typography.display,fontSize:34,lineHeight:40,marginTop:9},emptyCopy:{...typography.body,color:colors.textSecondary,lineHeight:23,maxWidth:330,marginTop:12},emptyButton:{marginTop:spacing.xxl,width:'100%'},error:{borderWidth:1,borderColor:colors.border,padding:12,marginBottom:16},errorText:{...typography.caption,color:colors.textSecondary}});
