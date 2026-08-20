import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { getProduct } from '@/data/catalog';
import { colors, spacing, typography } from '@/theme';
import { Button, IconButton, Input, Text } from '@/components/ui';

export default function CreateReviewScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const product = getProduct(productId);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (!product) return <View style={styles.container}><Text style={styles.title}>Product not found.</Text></View>;
  if (submitted) return <View style={styles.success}><View style={styles.successMark}><Star size={22} color={colors.accent} fill={colors.accent} /></View><Text style={styles.successTitle}>Thank you for your review.</Text><Text style={styles.successBody}>Your review has been submitted for moderation and will appear once approved.</Text><Button label="Back to product" onPress={() => router.replace(`/product/${product.id}`)} style={styles.successButton} /></View>;
  return <View style={styles.container}>
    <View style={styles.header}><IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} /><Text style={styles.headerTitle}>Write a review</Text><View style={{ width: 42 }} /></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>{product.category.toUpperCase()}</Text><Text style={styles.product}>{product.name}</Text>
      <Text style={styles.label}>YOUR RATING</Text>
      <View style={styles.stars}>{[1,2,3,4,5].map((value) => <Pressable key={value} onPress={() => setRating(value)} hitSlop={8}><Star size={30} color={colors.text} fill={value <= rating ? colors.text : 'transparent'} strokeWidth={1.5} /></Pressable>)}</View>
      <View style={styles.form}><Input label="TITLE" placeholder="Give your review a short title" value={title} onChangeText={setTitle} /><Input label="YOUR EXPERIENCE" placeholder="Tell other customers about fit, quality and how you use it." value={body} onChangeText={setBody} multiline style={styles.textarea} /></View>
      <Text style={styles.note}>Reviews are available to verified purchasers and may be moderated for relevance and safety.</Text>
      <Button label="Submit review" disabled={!rating || !body.trim()} onPress={() => setSubmitted(true)} style={styles.submit} />
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, header: { paddingTop: 58, paddingHorizontal: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, headerTitle: { ...typography.h3 }, content: { padding: spacing.xl, paddingTop: 28, paddingBottom: 50 }, eyebrow: { ...typography.label, color: colors.textMuted, letterSpacing: 1.4 }, product: { ...typography.display, fontSize: 31, lineHeight: 36, marginTop: 6 }, label: { ...typography.label, color: colors.textMuted, letterSpacing: 1.2, marginTop: 40, marginBottom: 13 }, stars: { flexDirection: 'row', gap: 12 }, form: { gap: 18, marginTop: 38 }, textarea: { minHeight: 150, textAlignVertical: 'top', paddingTop: 14 }, note: { ...typography.caption, color: colors.textMuted, marginTop: 22, lineHeight: 18 }, submit: { marginTop: 28 }, success: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' }, successMark: { width: 54, height: 54, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }, successTitle: { ...typography.h1, textAlign: 'center' }, successBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 10, maxWidth: 320 }, successButton: { width: '100%', marginTop: 30 }, });
