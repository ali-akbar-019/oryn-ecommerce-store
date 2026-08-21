import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { Text, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';
import { toCard } from '@/services/catalog/mappers';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const query = useWishlist();
  const remove = useRemoveWishlist();
  const add = useAddWishlist();

  const items = query.data?.items ?? [];
  const ids = new Set(items.map((item: any) => item.productId));

  // Fix: Filter out items without product and map safely
  const products = items
    .map((item: any) => item.product)
    .filter((product: any) => product && typeof product === 'object');

  // Check if product has name property before rendering
  const validProducts = products.filter((product: any) => product.name);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>SAVED PIECES</Text>
      <Text style={styles.title}>Wishlist</Text>
      <Text style={styles.copy}>
        {validProducts.length
          ? `${validProducts.length} ${validProducts.length === 1 ? 'piece' : 'pieces'} saved for later.`
          : 'Keep the pieces you are not ready to buy close at hand.'
        }
      </Text>

      {query.isLoading ? (
        <View style={styles.loading}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      ) : query.isError ? (
        <ErrorState
          title="Wishlist unavailable"
          message="Check your connection and try again."
          onRetry={() => query.refetch()}
        />
      ) : validProducts.length ? (
        <ProductGrid
          products={validProducts}
          onPress={(id) => router.push(`/product/${id}`)}
          wishlistIds={ids}
          onToggleWishlist={(id) => remove.mutate(id)}
        />
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on a piece you want to keep close."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 100
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5
  },
  title: {
    ...typography.display,
    fontSize: 34,
    lineHeight: 40,
    marginTop: 7
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: 320,
    marginTop: 10,
    marginBottom: 28
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