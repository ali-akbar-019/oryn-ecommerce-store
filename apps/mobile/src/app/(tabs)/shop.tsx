import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text, IconButton, ErrorState, EmptyState, Skeleton } from '@/components/ui';
import { SearchBar } from '@/components/discovery/SearchBar';
import { CategoryFilter } from '@/components/discovery/CategoryFilter';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';

export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const categoriesQuery = useCategories();
  const initial = params.category ?? 'all';
  const [category, setCategory] = useState(initial);
  const categorySlug = category === 'all' ? undefined : category;
  const productsQuery = useProducts({ category: categorySlug, page: 1, limit: 60 });
  const wishlistQuery = useWishlist();
  const addWishlist = useAddWishlist(); const removeWishlist = useRemoveWishlist();
  const wishlistIds = new Set((wishlistQuery.data?.items ?? []).map((item: any) => item.productId));
  const categories = [{ id: 'all', name: 'All', slug: 'all' }, ...(categoriesQuery.data ?? [])];
  const toggleWishlist = (id: string) => wishlistIds.has(id) ? removeWishlist.mutate(id) : addWishlist.mutate(id);
  return <View style={styles.container}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>THE COLLECTION</Text><Text style={styles.title}>Shop</Text></View><IconButton icon={SlidersHorizontal} accessibilityLabel="Filters" onPress={() => {}} /></View>
    <SearchBar onPress={() => router.push('/search')} />
    <View style={styles.filter}><CategoryFilter value={category} items={categories.map((item) => ({ name: item.name, slug: item.slug }))} onChange={setCategory} /></View>
    <View style={styles.meta}><Text style={styles.count}>{productsQuery.data?.total ?? 0} pieces</Text><Text style={styles.sort}>Newest</Text></View>
    {productsQuery.isLoading ? <View style={styles.loading}><Skeleton style={styles.skeleton}/><Skeleton style={styles.skeleton}/></View> : productsQuery.isError ? <ErrorState title="Could not load the collection" message="Check your connection and try again." onRetry={() => productsQuery.refetch()} /> : productsQuery.data?.items.length ? <ProductGrid products={productsQuery.data.items} onPress={(id) => router.push(`/product/${id}`)} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist}/> : <EmptyState title="No pieces found" message="Try another category or search the collection." />}
  </ScrollView></View>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:colors.background},scroll:{paddingHorizontal:spacing.xl,paddingTop:26,paddingBottom:100},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginBottom:22},eyebrow:{...typography.label,color:colors.textMuted,letterSpacing:1.5},title:{...typography.display,marginTop:5},filter:{marginTop:22},meta:{flexDirection:'row',justifyContent:'space-between',paddingVertical:22},count:{...typography.caption,color:colors.textSecondary},sort:{...typography.caption,color:colors.textMuted},loading:{flexDirection:'row',justifyContent:'space-between'},skeleton:{width:'48%',height:250}});
