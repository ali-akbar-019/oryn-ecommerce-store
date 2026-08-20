import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text, IconButton } from '@/components/ui';
import { SearchBar } from '@/components/discovery/SearchBar';
import { CategoryFilter } from '@/components/discovery/CategoryFilter';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { products } from '@/data/catalog';

export default function ShopScreen() {
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => category === 'All' ? products : products.filter((p) => p.category === category), [category]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>THE COLLECTION</Text><Text style={styles.title}>Shop</Text></View>
          <IconButton icon={SlidersHorizontal} accessibilityLabel="Open filters" />
        </View>
        <SearchBar onPress={() => router.push('/search')} />
        <View style={styles.filter}><CategoryFilter value={category} onChange={setCategory} /></View>
        <View style={styles.meta}><Text style={styles.count}>{filtered.length} pieces</Text><Text style={styles.sort}>Featured · Newest</Text></View>
        <ProductGrid products={filtered} onPress={(id) => router.push(`/product/${id}`)} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, scroll: { paddingHorizontal: spacing.xl, paddingTop: 26 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }, eyebrow: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 }, title: { ...typography.display, marginTop: 5 }, filter: { marginTop: 22 }, meta: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 22 }, count: { ...typography.caption, color: colors.textSecondary }, sort: { ...typography.caption, color: colors.textMuted }, });
