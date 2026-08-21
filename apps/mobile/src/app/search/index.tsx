import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text, IconButton, ErrorState, EmptyState } from '@/components/ui';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { useProducts } from '@/hooks/useCatalog';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = useProducts({ q: query.trim() || undefined, page: 1, limit: 60 });
  const wishlist = useWishlist(); const add = useAddWishlist(); const remove = useRemoveWishlist();
  const ids = new Set((wishlist.data?.items ?? []).map((item: any) => item.productId));
  const toggle = (id: string) => ids.has(id) ? remove.mutate(id) : add.mutate(id);
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll,{paddingTop:insets.top+spacing.md}]}>
    <View style={styles.top}><IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} /><Text style={styles.logo}>ORYN</Text><View style={{ width: 40 }} /></View>
    <Text style={styles.eyebrow}>DISCOVER</Text><Text style={styles.title}>Find your next piece.</Text>
    <View style={styles.inputWrap}><Search size={19} color={colors.textMuted}/><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search products, categories..." placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="search"/></View>
    {!query ? <View style={styles.recent}><Text style={styles.smallTitle}>SEARCH THE COLLECTION</Text><Text style={styles.recentCopy}>Try a product name, category or brand.</Text></View> : null}
    <View style={styles.resultHead}><Text style={styles.resultTitle}>{query ? `Results for “${query}”` : 'All pieces'}</Text><Text style={styles.resultCount}>{results.data?.total ?? 0}</Text></View>
    {results.isLoading ? null : results.isError ? <ErrorState title="Search is unavailable" message="Check your connection and try again." onRetry={() => results.refetch()}/> : results.data?.items.length ? <ProductGrid products={results.data.items} onPress={(id) => router.push(`/product/${id}`)} wishlistIds={ids} onToggleWishlist={toggle}/> : <EmptyState title="Nothing matched that search" message="Try a broader product name, category or brand."/>}
  </ScrollView></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},scroll:{paddingHorizontal:spacing.xl,paddingBottom:40},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:42},logo:{...typography.label,fontSize:15,letterSpacing:4},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},title:{...typography.h1,marginTop:8,maxWidth:300},inputWrap:{marginTop:28,height:56,backgroundColor:colors.surface,borderBottomWidth:1,borderColor:colors.text,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:4},input:{flex:1,...typography.body,color:colors.text,height:56},recent:{marginTop:34},smallTitle:{...typography.label,color:colors.textMuted,letterSpacing:1.2},recentCopy:{...typography.body,color:colors.textSecondary,marginTop:10},resultHead:{flexDirection:'row',justifyContent:'space-between',marginTop:38,marginBottom:22},resultTitle:{...typography.h3},resultCount:{...typography.caption,color:colors.textMuted}});
