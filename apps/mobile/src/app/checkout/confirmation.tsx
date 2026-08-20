import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useCartStore } from '@/store/cartStore';
import { colors, spacing, typography } from '@/theme';

export default function ConfirmationScreen() {
  const clear = useCartStore((state) => state.clear);
  return <View style={styles.container}><View style={styles.mark}><Check size={34} color={colors.white} strokeWidth={1.8}/></View><Text style={styles.eyebrow}>ORDER CONFIRMED</Text><Text style={styles.title}>Thank you for choosing ORYN.</Text><Text style={styles.copy}>Your order has been placed successfully. We'll keep you updated as it moves from our studio to your door.</Text><View style={styles.order}><Text style={styles.orderLabel}>ORDER NUMBER</Text><Text style={styles.orderNumber}>ORYN-240819</Text></View><Button label="View orders" onPress={() => { clear(); router.replace('/orders'); }} style={styles.button}/><Button label="Continue shopping" variant="secondary" onPress={() => { clear(); router.replace('/shop'); }} style={styles.button}/></View>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background,padding:spacing.xl,justifyContent:'center',alignItems:'center'},mark:{width:68,height:68,borderRadius:34,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center',marginBottom:spacing.xxl},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},title:{...typography.display,fontSize:34,lineHeight:40,textAlign:'center',marginTop:9},copy:{...typography.body,color:colors.textSecondary,textAlign:'center',lineHeight:23,maxWidth:340,marginTop:14},order:{width:'100%',borderTopWidth:1,borderBottomWidth:1,borderColor:colors.border,marginTop:spacing.xxl,paddingVertical:18,alignItems:'center'},orderLabel:{...typography.label,color:colors.textMuted,letterSpacing:1.2},orderNumber:{...typography.bodyMedium,marginTop:5},button:{width:'100%',marginTop:12}});
