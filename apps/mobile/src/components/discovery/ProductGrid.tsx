import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { ProductCard } from '@/components/product/ProductCard';
import type { ApiProduct } from '@/services/catalog/types';
import { toCard } from '@/services/catalog/mappers';

interface ProductGridProps {
  products: ApiProduct[];
  onPress: (id: string) => void;
  wishlistIds?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

export function ProductGrid({
  products,
  onPress,
  wishlistIds,
  onToggleWishlist
}: ProductGridProps) {
  // Filter out invalid products before rendering
  const validProducts = products.filter((product) => product && product.id);

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.grid}>
      {validProducts.map((item) => {
        // Safely map the product
        const cardProduct = item ? toCard(item) : null;
        if (!cardProduct) return null;

        return (
          <View key={item.id} style={styles.cell}>
            <ProductCard
              product={cardProduct}
              onPress={() => onPress(item.id)}
              wishlisted={wishlistIds?.has(item.id) ?? false}
              onToggleWishlist={() => onToggleWishlist?.(item.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 28
  },
  cell: {
    width: '48%',
    marginBottom: 28
  }
});