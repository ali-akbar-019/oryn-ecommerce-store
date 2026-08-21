import { useMemo, useState, type ReactNode } from 'react';
import { Dimensions, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Minus, Plus, Share2, Star, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { Button, IconButton, Text, Divider, ErrorState, Skeleton } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { useProduct, useProducts } from '@/hooks/useCatalog';
import { useAddWishlist, useRemoveWishlist, useWishlist } from '@/hooks/useCommerce';
import { money, primaryVariant, toCard } from '@/services/catalog/mappers';
import type { ApiProduct } from '@/services/catalog/types';
import { useCartStore } from '@/store/cartStore';

const WIDTH = Dimensions.get('window').width;

// Helper function to collect attribute values
function collectAttributeValues(product: ApiProduct, key: string) {
  const attr = product.attributes?.find(
    (item) => item.name.toLowerCase() === key
  );
  if (attr) return attr.values.map((item) => item.value);

  return Array.from(
    new Set(
      product.variants.flatMap((variant) =>
        Object.entries(variant.attributes ?? {})
          .filter(([name]) => name.toLowerCase() === key)
          .map(([, value]) => String(value))
      )
    )
  );
}

// Helper components
function Option({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.optionBlock}>
      <Text style={styles.optionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProduct(id ?? '');
  const product = query.data;

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();

  const wishlist = useWishlist();
  const addWishlist = useAddWishlist();
  const removeWishlist = useRemoveWishlist();
  const addVariant = useCartStore((state) => state.addVariant);
  const cartLoading = useCartStore((state) => state.loading);

  const relatedQuery = useProducts({
    category: product?.category?.slug,
    page: 1,
    limit: 6
  });

  const wishlistIds = new Set(
    (wishlist.data?.items ?? []).map((item: any) => item.productId)
  );

  const variant = product
    ? (product.variants.find((item) => item.id === selectedVariantId) ?? primaryVariant(product))
    : undefined;

  const colorValues = product ? collectAttributeValues(product, 'color') : [];
  const sizeValues = product ? collectAttributeValues(product, 'size') : [];

  const [selectedColor, setSelectedColor] = useState<string | undefined>(colorValues[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizeValues[0]);

  const chooseVariant = (color?: string, size?: string) => {
    const found = product?.variants.find((item) => {
      const values = Object.values(item.attributes ?? {}).map(String);
      return (!color || values.includes(color)) && (!size || values.includes(size));
    });
    if (found) setSelectedVariantId(found.id);
  };

  // Loading state
  if (query.isLoading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <Skeleton style={styles.loadingImage} />
        <View style={styles.loadingBody}>
          <Skeleton style={styles.loadingLine} />
          <Skeleton style={styles.loadingLine} />
          <Skeleton style={styles.loadingBlock} />
        </View>
      </View>
    );
  }

  // Error state
  if (query.isError || !product) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + spacing.xl }]}>
        <ErrorState
          title="Piece unavailable"
          message="We could not load this product right now."
          onRetry={() => query.refetch()}
        />
        <Button label="Back to shop" onPress={() => router.replace('/shop')} />
      </View>
    );
  }

  const isWishlisted = wishlistIds.has(product.id);
  const related = (relatedQuery.data?.items ?? [])
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const image = product.images[activeImage]?.url ?? product.images[0]?.url;
  const stock = variant?.inventory?.quantity ?? variant?.stockQuantity ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Image Area */}
        <View style={styles.imageArea}>
          <Image
            source={image}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />

          {/* Overlay Buttons */}
          <View style={[styles.overlayTop, { top: insets.top + spacing.sm }]}>
            <IconButton
              icon={ArrowLeft}
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />
            <View style={styles.overlayActions}>
              <IconButton
                icon={Share2}
                accessibilityLabel="Share product"
                onPress={async () => {
                  await Share.share({
                    message: `Explore ${product.name} on ORYN.`
                  });
                }}
              />
              <Pressable
                accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onPress={() =>
                  isWishlisted
                    ? removeWishlist.mutate(product.id)
                    : addWishlist.mutate(product.id)
                }
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                })}
              >
                <Heart
                  size={19}
                  color={isWishlisted ? colors.accent : colors.text}
                  fill={isWishlisted ? colors.accent : 'transparent'}
                />
              </Pressable>
            </View>
          </View>

          {/* Thumbnails */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbs}
          >
            {product.images.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setActiveImage(index)}
                style={[styles.thumb, activeImage === index && styles.thumbActive]}
              >
                <Image source={item.url} style={styles.thumbImage} />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Product Details */}
        <View style={styles.details}>
          <Text style={styles.category}>{product.category.name.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand ?? 'ORYN'}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{money(variant?.price)}</Text>
            {variant?.compareAtPrice != null ? (
              <Text style={styles.compare}>{money(variant.compareAtPrice)}</Text>
            ) : null}
          </View>

          <Text style={styles.stock}>
            {stock > 0 ? `${stock} available` : 'Currently unavailable'}
          </Text>

          <Text style={styles.description}>
            {product.description ?? 'A considered ORYN piece designed for everyday use.'}
          </Text>

          <Divider />

          {/* Color Options */}
          {colorValues.length ? (
            <Option title="COLOR">
              <View style={styles.options}>
                {colorValues.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => {
                      setSelectedColor(color);
                      chooseVariant(color, selectedSize);
                    }}
                    style={[styles.colorOption, selectedColor === color && styles.selectedOption]}
                  >
                    <Text style={styles.optionText}>{color}</Text>
                  </Pressable>
                ))}
              </View>
            </Option>
          ) : null}

          {/* Size Options */}
          {sizeValues.length ? (
            <Option title="SIZE">
              <View style={styles.options}>
                {sizeValues.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => {
                      setSelectedSize(size);
                      chooseVariant(selectedColor, size);
                    }}
                    style={[styles.sizeOption, selectedSize === size && styles.selectedOption]}
                  >
                    <Text style={styles.optionText}>{size}</Text>
                  </Pressable>
                ))}
              </View>
            </Option>
          ) : null}

          {/* Quantity */}
          <Option title="QUANTITY">
            <View style={styles.quantity}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyButton}
              >
                <Minus size={15} color={colors.text} />
              </Pressable>
              <Text style={styles.qtyText}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity(Math.min(Math.max(stock, 1), quantity + 1))}
                style={styles.qtyButton}
              >
                <Plus size={15} color={colors.text} />
              </Pressable>
            </View>
          </Option>

          {/* Add to Cart Button */}
          <Button
            label={cartLoading ? 'Adding…' : 'Add to bag'}
            disabled={!variant || stock < quantity}
            onPress={async () => {
              if (!variant) return;
              await addVariant(product, variant.id, quantity);
              router.push('/(tabs)/cart');
            }}
            style={styles.addButton}
          />

          {/* Product Info */}
          <View style={styles.info}>
            <InfoRow title="Materials" value="Product specifications are provided by the catalog." />
            <InfoRow title="Shipping" value="Delivery options are shown at checkout." />
            <InfoRow title="Returns" value="Return eligibility is managed through your order." />
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View>
                <Text style={styles.reviewsEyebrow}>CUSTOMER NOTES</Text>
                <Text style={styles.reviewsTitle}>Reviews</Text>
              </View>
              <Pressable
                onPress={() => router.push(`/reviews/create?productId=${product.id}`)}
                style={styles.writeReview}
              >
                <Text style={styles.writeReviewText}>Write a review</Text>
                <ChevronRight size={15} color={colors.text} />
              </Pressable>
            </View>

            {product.reviews?.length ? (
              product.reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.review}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewAuthor}>
                      {review.user.firstName} {review.user.lastName}
                    </Text>
                  </View>
                  <View style={styles.starLine}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={11}
                        color={colors.text}
                        fill={i <= review.rating ? colors.text : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewTitle}>{review.title}</Text>
                  <Text style={styles.reviewBody}>{review.body}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>
                No reviews yet. Be the first to share your experience.
              </Text>
            )}
          </View>
        </View>

        {/* Related Products */}
        {related.length ? (
          <View style={styles.related}>
            <Text style={styles.relatedEyebrow}>COMPLETE THE EDIT</Text>
            <Text style={styles.relatedTitle}>You may also like</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRail}
            >
              {related.map((item) => {
                const cardProduct = toCard(item);
                if (!cardProduct) return null;

                return (
                  <View key={item.id} style={styles.relatedCard}>
                    <ProductCard
                      product={cardProduct}
                      onPress={() => router.push(`/product/${item.id}`)}
                      wishlisted={wishlistIds.has(item.id)}
                      onToggleWishlist={() =>
                        wishlistIds.has(item.id)
                          ? removeWishlist.mutate(item.id)
                          : addWishlist.mutate(item.id)
                      }
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingBottom: 50
  },
  imageArea: {
    position: 'relative',
    backgroundColor: colors.surfaceMuted
  },
  heroImage: {
    width: WIDTH,
    height: WIDTH * 1.16
  },
  overlayTop: {
    position: 'absolute',
    top: 18,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  overlayActions: {
    flexDirection: 'row',
    gap: 8
  },
  thumbs: {
    position: 'absolute',
    bottom: 14,
    left: spacing.xl,
    gap: 8
  },
  thumb: {
    width: 50,
    height: 62,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  thumbActive: {
    borderColor: colors.text
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  details: {
    padding: spacing.xl
  },
  category: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4
  },
  name: {
    ...typography.display,
    fontSize: 31,
    lineHeight: 36,
    marginTop: 6
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 5
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15
  },
  price: {
    ...typography.h2
  },
  compare: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'line-through'
  },
  stock: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 7
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 22,
    lineHeight: 24,
    marginBottom: 25
  },
  optionBlock: {
    marginTop: 25
  },
  optionTitle: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 12
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  colorOption: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  sizeOption: {
    width: 52,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  selectedOption: {
    borderColor: colors.text,
    backgroundColor: colors.surfaceMuted
  },
  optionText: {
    ...typography.caption,
    color: colors.text
  },
  quantity: {
    height: 44,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    width: 132,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface
  },
  qtyButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyText: {
    ...typography.bodyMedium
  },
  addButton: {
    marginTop: 28
  },
  info: {
    marginTop: 28,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  infoRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  infoTitle: {
    ...typography.caption,
    color: colors.text
  },
  infoValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4
  },
  reviewsSection: {
    marginTop: 34,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 25
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  reviewsEyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4
  },
  reviewsTitle: {
    ...typography.h2,
    marginTop: 5
  },
  writeReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingBottom: 2
  },
  writeReviewText: {
    ...typography.caption,
    color: colors.text
  },
  review: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reviewAuthor: {
    ...typography.bodyMedium
  },
  starLine: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 8
  },
  reviewTitle: {
    ...typography.bodyMedium,
    marginTop: 9
  },
  reviewBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 21
  },
  noReviews: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: 20
  },
  related: {
    paddingTop: 15,
    paddingLeft: spacing.xl
  },
  relatedEyebrow: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.5
  },
  relatedTitle: {
    ...typography.h2,
    marginTop: 6
  },
  relatedRail: {
    gap: 16,
    paddingTop: 18,
    paddingRight: spacing.xl
  },
  relatedCard: {
    width: 175
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: 20
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingImage: {
    width: '100%',
    height: 430
  },
  loadingBody: {
    padding: spacing.xl,
    gap: 14
  },
  loadingLine: {
    height: 22
  },
  loadingBlock: {
    height: 120,
    marginTop: 10
  }
});