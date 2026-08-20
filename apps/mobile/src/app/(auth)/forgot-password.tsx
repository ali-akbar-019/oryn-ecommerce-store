import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
export default function ForgotPassword(){const [email,setEmail]=useState('');const [sent,setSent]=useState(false);return <View style={styles.container}><Pressable onPress={()=>router.back()} style={styles.back}><ArrowLeft size={20} color={colors.text}/></Pressable><View style={styles.icon}><Mail size={22} color={colors.accent}/></View><Text style={styles.kicker}>ACCOUNT RECOVERY</Text><Text style={styles.title}>Forgot your password?</Text><Text style={styles.intro}>{sent?'If an account exists for that email, recovery instructions are on their way.':'Enter your email and we’ll send you a secure reset link.'}</Text>{!sent&&<><Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"/><View style={{marginTop:spacing.xl}}><Button title="Send reset link" onPress={()=>setSent(true)} disabled={!email}/></View></>}</View>}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background,padding:spacing.xl,paddingTop:spacing.xxl},back:{width:40,height:40,alignItems:'center',justifyContent:'center',marginBottom:spacing.xxxl},icon:{width:48,height:48,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center',marginBottom:spacing.xl},kicker:{...typography.overline},title:{...typography.h1,fontSize:34,lineHeight:40,marginTop:spacing.md},intro:{...typography.body,color:colors.textSecondary,marginTop:10,marginBottom:spacing.xxl,maxWidth:340}});
