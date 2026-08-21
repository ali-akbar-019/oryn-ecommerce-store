import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const { register, loading, error, clearError } = useAuthStore();
  const submit = async () => { if (!firstName || !lastName || !email || password.length < 8) return; try { await register({ firstName, lastName, email, password }); router.replace('/(tabs)'); } catch {} };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={[styles.container,{paddingTop:insets.top+spacing.xl}]} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={colors.text}/></Pressable>
    <Text style={styles.kicker}>JOIN ORYN</Text><Text style={styles.title}>Make the collection yours.</Text><Text style={styles.intro}>Create an account to save pieces, manage orders and move seamlessly from discovery to checkout.</Text>
    <View style={styles.form}><View style={styles.row}><Input label="First name" value={firstName} onChangeText={clearErrorAnd(setFirstName, clearError)} placeholder="First name" style={styles.half}/><Input label="Last name" value={lastName} onChangeText={clearErrorAnd(setLastName, clearError)} placeholder="Last name" style={styles.half}/></View><Input label="Email" value={email} onChangeText={clearErrorAnd(setEmail, clearError)} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"/><Input label="Password" value={password} onChangeText={clearErrorAnd(setPassword, clearError)} secureTextEntry placeholder="At least 8 characters"/>{error ? <Text style={styles.error}>{error}</Text> : null}</View>
    <Button label={loading ? 'Creating…' : 'Create account'} onPress={submit} loading={loading} disabled={loading || !firstName || !lastName || !email || password.length < 8}/>
    <View style={styles.register}><Text style={styles.caption}>Already have an account?</Text><Pressable onPress={() => router.push('/(auth)/login')}><Text style={styles.link}>Sign in</Text></Pressable></View>
  </ScrollView></KeyboardAvoidingView>;
}
function clearErrorAnd(setter: (value: string) => void, clear: () => void) { return (value: string) => { clear(); setter(value); }; }
const styles=StyleSheet.create({flex:{flex:1,backgroundColor:colors.background},container:{padding:spacing.xl,paddingBottom:spacing.xxl,flexGrow:1},back:{width:40,height:40,alignItems:'center',justifyContent:'center',marginBottom:spacing.xxxl},kicker:{...typography.overline,marginBottom:spacing.md},title:{...typography.h1,fontSize:34,lineHeight:40},intro:{...typography.body,color:colors.textSecondary,maxWidth:340,marginTop:10,marginBottom:spacing.xxl},form:{gap:spacing.lg,marginBottom:spacing.xl},row:{flexDirection:'row',gap:spacing.md},half:{flex:1},error:{...typography.caption,color:colors.danger,marginTop:-8},register:{flexDirection:'row',justifyContent:'center',gap:6,marginTop:'auto',paddingTop:spacing.xxl},caption:{...typography.caption},link:{...typography.caption,color:colors.accent,fontWeight:'600'}});
