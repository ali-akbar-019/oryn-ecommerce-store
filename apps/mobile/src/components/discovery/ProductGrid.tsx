import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { ProductCard } from '@/components/product/ProductCard';
import type { ApiProduct } from '@/services/catalog/types';
import { toCard } from '@/services/catalog/mappers';

export function ProductGrid({ products, onPress, wishlistIds, onToggleWishlist }: { products: ApiProduct[]; onPress: (id: string) => void; wishlistIds?: Set<string>; onToggleWishlist?: (id: string) => void }) {
  return <View style={styles.grid}>{products.map((item) => <View key={item.id} style={styles.cell}><ProductCard product={toCard(item)} onPress={() => onPress(item.id)} wishlisted={wishlistIds?.has(item.id)} onToggleWishlist={() => onToggleWishlist?.(item.id)} /></View>)}</View>;
}
const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 28 }, cell: { width: '48%', marginBottom: 28 } });
