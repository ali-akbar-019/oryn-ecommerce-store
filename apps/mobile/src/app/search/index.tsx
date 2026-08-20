import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text, IconButton } from '@/components/ui';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { searchProducts } from '@/data/catalog';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchProducts(query), [query]);
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.top}><IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} /><Text style={styles.logo}>ORYN</Text><View style={{ width: 40 }} /></View>
      <Text style={styles.eyebrow}>DISCOVER</Text><Text style={styles.title}>Find your next piece.</Text>
      <View style={styles.inputWrap}><Search size={19} color={colors.textMuted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search products, categories..." placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="search" /></View>
      {!query ? <View style={styles.recent}><Text style={styles.smallTitle}>POPULAR SEARCHES</Text><View style={styles.words}><Text style={styles.word}>Wool coats</Text><Text style={styles.word}>Everyday bags</Text><Text style={styles.word}>Running shoes</Text><Text style={styles.word}>Automatic watches</Text></View></View> : null}
      <View style={styles.resultHead}><Text style={styles.resultTitle}>{query ? `Results for “${query}”` : 'All pieces'}</Text><Text style={styles.resultCount}>{results.length}</Text></View>
      {results.length ? <ProductGrid products={results} onPress={(id) => router.push(`/product/${id}`)} /> : <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing matched that search.</Text><Text style={styles.emptyBody}>Try a broader term or explore one of the popular searches above.</Text></View>}
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, scroll: { paddingHorizontal: spacing.xl, paddingTop: 22, paddingBottom: 40 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 42 }, logo: { ...typography.label, fontSize: 15, letterSpacing: 4 }, eyebrow: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 }, title: { ...typography.h1, marginTop: 8, maxWidth: 300 }, inputWrap: { marginTop: 28, height: 56, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.text, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }, input: { flex: 1, ...typography.body, color: colors.text, height: 56 }, recent: { marginTop: 34 }, smallTitle: { ...typography.label, color: colors.textMuted, letterSpacing: 1.2 }, words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }, word: { ...typography.body, color: colors.textSecondary, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 5 }, resultHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 38, marginBottom: 22 }, resultTitle: { ...typography.h3 }, resultCount: { ...typography.caption, color: colors.textMuted }, empty: { paddingVertical: 70, alignItems: 'center' }, emptyTitle: { ...typography.h3 }, emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, marginTop: 8 }, });
