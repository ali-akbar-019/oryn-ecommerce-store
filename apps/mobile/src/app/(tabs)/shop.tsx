import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { Text, ErrorState, EmptyState, Skeleton } from '@/components/ui';
import { SearchBar } from '@/components/discovery/SearchBar';
import { CategoryFilter } from '@/components/discovery/CategoryFilter';
import { SortFilterBar } from '@/components/discovery/SortFilterBar';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const categoriesQuery = useCategories();

  const initial = params.category ?? 'all';
  const [category, setCategory] = useState(initial);
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const categorySlug = category === 'all' ? undefined : category;
  const productsQuery = useProducts({ category: categorySlug, page: 1, limit: 60 });
  const wishlistQuery = useWishlist();
  const addWishlist = useAddWishlist();
  const removeWishlist = useRemoveWishlist();

  const wishlistIds = new Set((wishlistQuery.data?.items ?? []).map((item: any) => item.productId));
  const categories = [
    { id: 'all', name: 'All', slug: 'all' },
    ...(categoriesQuery.data ?? [])
  ];

  const toggleWishlist = (id: string) => {
    wishlistIds.has(id) ? removeWishlist.mutate(id) : addWishlist.mutate(id);
  };

  const sortedItems = (() => {
    const items = productsQuery.data?.items ?? [];
    if (sort === 'newest') return items;
    const priceOf = (p: (typeof items)[number]) =>
      Math.min(...p.variants.map((v) => Number(v.price)));
    return [...items].sort((a, b) =>
      sort === 'price-asc' ? priceOf(a) - priceOf(b) : priceOf(b) - priceOf(a)
    );
  })();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.md }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>THE COLLECTION</Text>
            <Text style={styles.title}>Shop</Text>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar onPress={() => router.push('/search')} />

        {/* Category Filter */}
        <View style={styles.filter}>
          <CategoryFilter
            value={category}
            items={categories.map((item) => ({
              name: item.name,
              slug: item.slug
            }))}
            onChange={setCategory}
          />
        </View>

        {/* Sort Filter Bar */}
        <SortFilterBar
          count={productsQuery.data?.total ?? 0}
          sort={sort}
          onChangeSort={setSort}
        />

        {/* Products Grid */}
        {productsQuery.isLoading ? (
          <View style={styles.loading}>
            <Skeleton style={styles.skeleton} />
            <Skeleton style={styles.skeleton} />
          </View>
        ) : productsQuery.isError ? (
          <ErrorState
            title="Could not load the collection"
            message="Check your connection and try again."
            onRetry={() => productsQuery.refetch()}
          />
        ) : sortedItems.length ? (
          <ProductGrid
            products={sortedItems}
            onPress={(id) => router.push(`/product/${id}`)}
            wishlistIds={wishlistIds}
            onToggleWishlist={toggleWishlist}
          />
        ) : (
          <EmptyState
            title="No pieces found"
            message="Try another category or search the collection."
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 22
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5
  },
  title: {
    ...typography.display,
    marginTop: 5
  },
  filter: {
    marginTop: 22
  },
  loading: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  skeleton: {
    width: '48%',
    height: 250
  }
});