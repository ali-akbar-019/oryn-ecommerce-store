import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const submit = async () => { if (!email || !password) return; try { await login(email, password); router.replace('/(tabs)'); } catch {} };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={20} color={colors.text} /></Pressable>
    <View style={styles.brand}><Text style={styles.logo}>ORYN</Text><Text style={styles.kicker}>WELCOME BACK</Text></View>
    <Text style={styles.title}>Return to your edit.</Text><Text style={styles.intro}>Sign in to keep your wishlist, orders and saved details close.</Text>
    <View style={styles.form}><Input label="Email" value={email} onChangeText={(value) => { clearError(); setEmail(value); }} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" /><Input label="Password" value={password} onChangeText={(value) => { clearError(); setPassword(value); }} secureTextEntry placeholder="Your password" />{error ? <Text style={styles.error}>{error}</Text> : null}</View>
    <Pressable onPress={() => router.push('/(auth)/forgot-password')}><Text style={styles.forgot}>Forgot password?</Text></Pressable>
    <Button label={loading ? 'Signing in…' : 'Sign in'} onPress={submit} loading={loading} disabled={loading || !email || !password} />
    <View style={styles.register}><Text style={styles.caption}>New to ORYN?</Text><Pressable onPress={() => router.push('/(auth)/register')}><Text style={styles.link}>Create an account</Text></Pressable></View>
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ flex:{flex:1,backgroundColor:colors.background}, container:{padding:spacing.xl,paddingTop:spacing.xxl,paddingBottom:spacing.xxl,flexGrow:1}, back:{width:40,height:40,alignItems:'center',justifyContent:'center',marginBottom:spacing.xxxl}, brand:{marginBottom:spacing.xl}, logo:{fontFamily:typography.display.fontFamily,fontSize:30,letterSpacing:4}, kicker:{...typography.overline,marginTop:8}, title:{...typography.h1,fontSize:34,lineHeight:40}, intro:{...typography.body,color:colors.textSecondary,maxWidth:330,marginTop:10,marginBottom:spacing.xxl}, form:{gap:spacing.lg}, forgot:{...typography.caption,color:colors.accent,textAlign:'right',marginVertical:spacing.md}, error:{...typography.caption,color:colors.danger,marginTop:-8}, register:{flexDirection:'row',justifyContent:'center',gap:6,marginTop:'auto',paddingTop:spacing.xxl}, caption:{...typography.caption},link:{...typography.caption,color:colors.accent,fontWeight:'600'} });
