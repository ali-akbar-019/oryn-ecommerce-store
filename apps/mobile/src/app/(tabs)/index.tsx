import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { Text, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { HomeHeader } from '@/components/navigation/HomeHeader';
import { SectionHeader } from '@/components/home/SectionHeader';
import { CategoryTile } from '@/components/home/CategoryTile';
import { EditorialBanner } from '@/components/home/EditorialBanner';
import { ProductCard } from '@/components/product/ProductCard';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';
import { toCard } from '@/services/catalog/mappers';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const productsQuery = useProducts({ page: 1, limit: 8 });
  const categoriesQuery = useCategories();
  const wishlistQuery = useWishlist();
  const addWishlist = useAddWishlist();
  const removeWishlist = useRemoveWishlist();

  const wishlistIds = new Set((wishlistQuery.data?.items ?? []).map((item: any) => item.productId));
  const products = productsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];

  const toggleWishlist = (id: string) => {
    wishlistIds.has(id) ? removeWishlist.mutate(id) : addWishlist.mutate(id);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <HomeHeader />

      {/* Intro Section */}
      <View style={styles.intro}>
        <Text style={styles.kicker}>THE NEW EDIT / AUTUMN 2026</Text>
        <Text style={styles.title}>Objects with intention.</Text>
        <Text style={styles.subtitle}>
          A considered selection of things made to be used, lived with and kept.
        </Text>
      </View>

      {/* Hero Section */}
      <Pressable style={styles.hero} onPress={() => router.push('/shop')}>
        <Image
          source="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=88"
          style={styles.heroImage}
          contentFit="cover"
          transition={220}
        />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <Text style={styles.heroKicker}>FEATURED COLLECTION</Text>
            <View style={styles.play}>
              <Play size={13} color={colors.white} fill={colors.white} />
            </View>
          </View>
          <View>
            <Text style={styles.heroTitle}>
              Quiet forms.{`\n`}Better essentials.
            </Text>
            <View style={styles.heroLink}>
              <Text style={styles.heroLinkText}>Explore the edit</Text>
              <ArrowRight size={17} color={colors.white} />
            </View>
          </View>
        </View>
      </Pressable>

      {/* Categories Section */}
      <View style={styles.section}>
        <SectionHeader title="Shop the collection" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {categories.slice(0, 6).map((category, index) => (
            <Pressable
              key={category.id}
              onPress={() => router.push({
                pathname: '/shop',
                params: { category: category.slug }
              })}
            >
              <CategoryTile
                title={category.name}
                index={String(index + 1).padStart(2, '0')}
                image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=85"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* New Arrivals Section */}
      <View style={styles.section}>
        <SectionHeader title="New arrivals" onPress={() => router.push('/shop')} />

        {productsQuery.isLoading ? (
          <View style={styles.loadingRow}>
            <Skeleton style={styles.skeleton} />
            <Skeleton style={styles.skeleton} />
          </View>
        ) : productsQuery.isError ? (
          <ErrorState
            title="Could not load the collection"
            message="Check your connection and try again."
            onRetry={() => productsQuery.refetch()}
          />
        ) : products.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productRail}
          >
            {products.slice(0, 4).map((product) => {
              const cardProduct = toCard(product);
              if (!cardProduct) return null;

              return (
                <View key={product.id} style={styles.productItem}>
                  <ProductCard
                    product={cardProduct}
                    onPress={() => router.push(`/product/${product.id}`)}
                    wishlisted={wishlistIds.has(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                  />
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <EmptyState
            title="The collection is coming together"
            message="Check back shortly for new arrivals."
          />
        )}
      </View>

      {/* Editorial Banner */}
      <EditorialBanner />

      {/* Why ORYN Section */}
      <View style={styles.manifesto}>
        <Text style={styles.manifestoKicker}>WHY ORYN</Text>
        <Text style={styles.manifestoTitle}>
          Less noise. More things worth keeping.
        </Text>
        <Text style={styles.manifestoBody}>
          We look for honest materials, useful forms and details that reward a second look.
          Nothing added without a reason.
        </Text>
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <SectionHeader title="Featured" onPress={() => router.push('/shop')} />
        <View style={styles.featuredGrid}>
          {/* to change later */}
          {products.slice(0, 4).map((product) => {
            const cardProduct = toCard(product);
            if (!cardProduct) return null;

            return (
              <View key={product.id} style={styles.featuredItem}>
                <ProductCard
                  product={cardProduct}
                  onPress={() => router.push(`/product/${product.id}`)}
                  wishlisted={wishlistIds.has(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to find your pieces?</Text>
        <Text style={styles.ctaSubtitle}>
          Explore our curated collection of intentional objects.
        </Text>
        <Pressable style={styles.ctaButton} onPress={() => router.push('/shop')}>
          <Text style={styles.ctaButtonText}>Shop All</Text>
          <ArrowRight size={17} color={colors.white} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120
  },
  intro: {
    marginBottom: spacing.xl
  },
  kicker: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm
  },
  title: {
    ...typography.display,
    color: colors.text,
    maxWidth: 340
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: 320,
    marginTop: spacing.md
  },
  hero: {
    height: 470,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#303733',
    marginBottom: spacing.xxxl
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13,18,16,0.34)'
  },
  heroContent: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    top: spacing.xl,
    bottom: spacing.xl,
    justifyContent: 'space-between'
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroKicker: {
    ...typography.label,
    color: colors.white,
    opacity: 0.82
  },
  play: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2
  },
  heroTitle: {
    ...typography.display,
    color: colors.white,
    fontSize: 35,
    lineHeight: 40
  },
  heroLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg
  },
  heroLinkText: {
    ...typography.bodyMedium,
    color: colors.white
  },
  section: {
    marginBottom: spacing.xxxl
  },
  rail: {
    gap: 10,
    paddingRight: spacing.lg
  },
  productRail: {
    gap: spacing.md,
    paddingRight: spacing.lg
  },
  productItem: {
    width: 175
  },
  loadingRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  skeleton: {
    width: 175,
    height: 230
  },
  manifesto: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.xxxl
  },
  manifestoKicker: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md
  },
  manifestoTitle: {
    ...typography.h1,
    color: colors.text,
    maxWidth: 340
  },
  manifestoBody: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: 340,
    marginTop: spacing.md
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  featuredItem: {
    width: '48%',
    marginBottom: spacing.md
  },
  cta: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xxxl
  },
  ctaTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center'
  },
  ctaSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  },
  ctaButton: {
    backgroundColor: colors.text,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ctaButtonText: {
    ...typography.bodyMedium,
    color: colors.white
  }
});