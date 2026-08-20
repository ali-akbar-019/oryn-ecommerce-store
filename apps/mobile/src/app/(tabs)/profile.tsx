import { Bell, ChevronRight, Heart, MapPin, Package, Settings, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';
import { AccountRow } from '@/components/account/AccountRow';
import { useNotificationStore } from '@/store/notificationStore';

export default function ProfileScreen() {
  const unread = useNotificationStore((state) => state.items.filter((item) => !item.read).length);
  return <View style={styles.container}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>ORYN / ACCOUNT</Text><Text style={styles.title}>Your account</Text></View><Pressable onPress={() => router.push('/notifications')} style={styles.bell}><Bell size={19} color={colors.text} />{unread ? <View style={styles.dot} /> : null}</Pressable></View>
    <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View><View style={styles.identityCopy}><Text style={styles.name}>Alex Morgan</Text><Text style={styles.email}>alex@example.com</Text></View><ChevronRight size={18} color={colors.textMuted} /></View>
    <Section title="ORDERS & SAVED"><AccountRow icon={Package} title="Orders" subtitle="Track current and past orders" onPress={() => router.push('/orders')} /><AccountRow icon={Heart} title="Wishlist" subtitle="Your saved pieces" onPress={() => router.push('/wishlist')} /><AccountRow icon={Bell} title="Notifications" subtitle={unread ? `${unread} unread updates` : 'No unread updates'} onPress={() => router.push('/notifications')} /></Section>
    <Section title="PERSONAL"><AccountRow icon={UserRound} title="Personal information" subtitle="Name, email and profile details" /><AccountRow icon={MapPin} title="Addresses" subtitle="Manage delivery addresses" /><AccountRow icon={ShieldCheck} title="Security" subtitle="Password and account security" /></Section>
    <Section title="PREFERENCES"><AccountRow icon={Settings} title="Settings" subtitle="Notifications, privacy and preferences" /></Section>
    <View style={styles.footer}><Text style={styles.footerBrand}>ORYN</Text><Text style={styles.footerText}>Quiet objects. Considered choices.</Text></View>
  </ScrollView></View>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.xl,paddingTop:62,paddingBottom:50},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.4},title:{...typography.display,fontSize:31,lineHeight:36,marginTop:5},bell:{width:44,height:44,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},dot:{position:'absolute',right:10,top:9,width:6,height:6,backgroundColor:colors.accent},identity:{marginTop:30,padding:18,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',gap:14},avatar:{width:48,height:48,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center'},avatarText:{...typography.h2,color:colors.accent},identityCopy:{flex:1},name:{...typography.bodyMedium},email:{...typography.caption,color:colors.textSecondary,marginTop:3},section:{marginTop:34},sectionTitle:{...typography.label,color:colors.textMuted,letterSpacing:1.3,marginBottom:2},footer:{marginTop:46,paddingTop:26,borderTopWidth:1,borderColor:colors.border},footerBrand:{...typography.h2,letterSpacing:3},footerText:{...typography.caption,color:colors.textMuted,marginTop:5}});
