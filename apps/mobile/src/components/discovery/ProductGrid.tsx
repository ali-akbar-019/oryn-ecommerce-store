import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/data/catalog';

export function ProductGrid({ products, onPress }: { products: Product[]; onPress: (id: string) => void }) {
  return <FlatList data={products} numColumns={2} keyExtractor={(item) => item.id} columnWrapperStyle={styles.row} contentContainerStyle={styles.content} renderItem={({ item }) => <View style={styles.cell}><ProductCard product={{ ...item, price: `$${item.price}`, compareAt: item.compareAt ? `$${item.compareAt}` : undefined }} onPress={() => onPress(item.id)} /></View>} />;
}
const styles = StyleSheet.create({ content: { paddingBottom: 28 }, row: { justifyContent: 'space-between', marginBottom: 28 }, cell: { width: '48%' } });
