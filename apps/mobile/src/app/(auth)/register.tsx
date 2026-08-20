import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const { register, loading } = useAuthStore();
  const submit=async()=>{if(!name||!email||!password)return;await register(name,email,password);router.replace('/(tabs)');};
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Pressable onPress={()=>router.back()} style={styles.back}><ArrowLeft size={20} color={colors.text}/></Pressable>
    <Text style={styles.kicker}>JOIN ORYN</Text><Text style={styles.title}>Make the collection yours.</Text><Text style={styles.intro}>Create an account to save pieces, manage orders and move seamlessly from discovery to checkout.</Text>
    <View style={styles.form}><Input label="Full name" value={name} onChangeText={setName} placeholder="Your name"/><Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"/><Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters"/></View>
    <Button title={loading?'Creating…':'Create account'} onPress={submit} disabled={loading||!name||!email||!password}/>
    <View style={styles.register}><Text style={styles.caption}>Already have an account?</Text><Pressable onPress={()=>router.push('/(auth)/login')}><Text style={styles.link}>Sign in</Text></Pressable></View>
  </ScrollView></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({flex:{flex:1,backgroundColor:colors.background},container:{padding:spacing.xl,paddingTop:spacing.xxl,flexGrow:1},back:{width:40,height:40,alignItems:'center',justifyContent:'center',marginBottom:spacing.xxxl},kicker:{...typography.overline,marginBottom:spacing.md},title:{...typography.h1,fontSize:34,lineHeight:40},intro:{...typography.body,color:colors.textSecondary,maxWidth:340,marginTop:10,marginBottom:spacing.xxl},form:{gap:spacing.lg,marginBottom:spacing.xl},register:{flexDirection:'row',justifyContent:'center',gap:6,marginTop:'auto',paddingTop:spacing.xxl},caption:{...typography.caption},link:{...typography.caption,color:colors.accent,fontWeight:'600'}});
