import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';
import type { ProductCardModel } from '@/services/catalog/types';

type Props = {
  product: ProductCardModel;
  onPress?: () => void;
  wishlisted?: boolean;
  onToggleWishlist?: () => void;
};

export function ProductCard({
  product,
  onPress,
  wishlisted = false,
  onToggleWishlist
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={[styles.imageWrap, product.tone ? { backgroundColor: product.tone } : null]}>
        <Image source={product.image} style={styles.image} contentFit="cover" transition={180} />

        <Pressable
          style={styles.wishlist}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onToggleWishlist?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            size={18}
            color={wishlisted ? colors.accent : colors.text}
            fill={wishlisted ? colors.accent : 'transparent'}
            strokeWidth={1.7}
          />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}</Text>
          {product.compareAt ? (
            <Text style={styles.compareAt}>{product.compareAt}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%'
  },
  imageWrap: {
    aspectRatio: 0.78,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  wishlist: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(248,247,244,0.92)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  meta: {
    paddingTop: 11
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: 3
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5
  },
  price: {
    ...typography.bodyMedium,
    color: colors.text
  },
  compareAt: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through'
  }
});