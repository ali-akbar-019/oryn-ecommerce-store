import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Minus, Plus, Share2, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { colors, spacing, typography } from '@/theme';
import { Button, IconButton, Text, Divider } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { getProduct, products } from '@/data/catalog';

const WIDTH = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const related = useMemo(() => products.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 3), [product]);
  if (!product) return <View style={styles.missing}><Text style={styles.missingTitle}>Piece not found.</Text><Button title="Back to shop" onPress={() => router.replace('/shop')} /></View>;

  return <View style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.imageArea}>
        <Image source={product.images[activeImage]} style={styles.heroImage} contentFit="cover" transition={200} />
        <View style={styles.overlayTop}><IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} /><View style={styles.overlayActions}><IconButton icon={Share2} accessibilityLabel="Share product" /><IconButton icon={Heart} accessibilityLabel="Add to wishlist" /></View></View>
        {product.badge ? <View style={styles.badge}><Text style={styles.badgeText}>{product.badge}</Text></View> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>{product.images.map((image, index) => <Pressable key={image} onPress={() => setActiveImage(index)} style={[styles.thumb, activeImage === index && styles.thumbActive]}><Image source={image} style={styles.thumbImage} /></Pressable>)}</ScrollView>
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.rating}><Star size={14} color={colors.text} fill={colors.text} /><Text style={styles.ratingText}>{product.rating} · {product.reviewCount} reviews</Text></View>
        <View style={styles.priceRow}><Text style={styles.price}>${product.price}</Text>{product.compareAt ? <Text style={styles.compare}>${product.compareAt}</Text> : null}</View>
        <Text style={styles.description}>{product.description}</Text>
        <Divider />
        <Option title="COLOR"><View style={styles.options}>{product.colors.map((color) => <Pressable key={color} onPress={() => setSelectedColor(color)} style={[styles.colorOption, selectedColor === color && styles.selectedOption]}><Text style={styles.optionText}>{color}</Text></Pressable>)}</View></Option>
        {product.sizes ? <Option title="SIZE"><View style={styles.options}>{product.sizes.map((size) => <Pressable key={size} onPress={() => setSelectedSize(size)} style={[styles.sizeOption, selectedSize === size && styles.selectedOption]}><Text style={styles.optionText}>{size}</Text></Pressable>)}</View></Option> : null}
        <Option title="QUANTITY"><View style={styles.quantity}><Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyButton}><Minus size={15} color={colors.text} /></Pressable><Text style={styles.qtyText}>{quantity}</Text><Pressable onPress={() => setQuantity(quantity + 1)} style={styles.qtyButton}><Plus size={15} color={colors.text} /></Pressable></View></Option>
        <Button title="Add to bag" onPress={() => {}} style={styles.addButton} />
        <View style={styles.info}><InfoRow title="Materials" value={product.material} /><InfoRow title="Shipping" value="Complimentary delivery over $150" /><InfoRow title="Returns" value="30-day returns on unworn pieces" /></View>
      </View>
      {related.length ? <View style={styles.related}><Text style={styles.relatedEyebrow}>COMPLETE THE EDIT</Text><Text style={styles.relatedTitle}>You may also like</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRail}>{related.map((item) => <ProductCard key={item.id} product={{ ...item, price: `$${item.price}`, compareAt: item.compareAt ? `$${item.compareAt}` : undefined }} onPress={() => router.push(`/product/${item.id}`)} />)}</ScrollView></View> : null}
    </ScrollView>
  </View>;
}
function Option({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.optionBlock}><Text style={styles.optionTitle}>{title}</Text>{children}</View>; }
function InfoRow({ title, value }: { title: string; value: string }) { return <View style={styles.infoRow}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, content: { paddingBottom: 50 }, imageArea: { position: 'relative', backgroundColor: colors.surfaceMuted }, heroImage: { width: WIDTH, height: WIDTH * 1.16 }, overlayTop: { position: 'absolute', top: 18, left: spacing.xl, right: spacing.xl, flexDirection: 'row', justifyContent: 'space-between' }, overlayActions: { flexDirection: 'row', gap: 8 }, badge: { position: 'absolute', left: spacing.xl, bottom: 74, backgroundColor: colors.text, paddingHorizontal: 10, paddingVertical: 6 }, badgeText: { ...typography.caption, color: colors.white }, thumbs: { position: 'absolute', bottom: 14, left: spacing.xl, gap: 8 }, thumb: { width: 50, height: 62, borderWidth: 1, borderColor: 'transparent' }, thumbActive: { borderColor: colors.text }, thumbImage: { width: '100%', height: '100%' }, details: { padding: spacing.xl }, category: { ...typography.label, color: colors.textMuted, letterSpacing: 1.4 }, name: { ...typography.display, fontSize: 31, lineHeight: 36, marginTop: 6 }, rating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 }, ratingText: { ...typography.caption, color: colors.textSecondary }, priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 }, price: { ...typography.h2 }, compare: { ...typography.body, color: colors.textMuted, textDecorationLine: 'line-through' }, description: { ...typography.body, color: colors.textSecondary, marginTop: 22, lineHeight: 24, marginBottom: 25 }, optionBlock: { marginTop: 25 }, optionTitle: { ...typography.label, color: colors.textMuted, letterSpacing: 1.2, marginBottom: 12 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, colorOption: { paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, sizeOption: { width: 52, height: 44, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, selectedOption: { borderColor: colors.text, backgroundColor: colors.surfaceMuted }, optionText: { ...typography.caption, color: colors.text }, quantity: { height: 44, flexDirection: 'row', borderWidth: 1, borderColor: colors.border, width: 132, alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface }, qtyButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, qtyText: { ...typography.bodyMedium }, addButton: { marginTop: 28 }, info: { marginTop: 28, borderTopWidth: 1, borderColor: colors.border }, infoRow: { paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.border }, infoTitle: { ...typography.caption, color: colors.text }, infoValue: { ...typography.body, color: colors.textSecondary, marginTop: 4 }, related: { paddingTop: 15, paddingLeft: spacing.xl }, relatedEyebrow: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 }, relatedTitle: { ...typography.h2, marginTop: 6 }, relatedRail: { gap: 16, paddingTop: 18, paddingRight: spacing.xl }, missing: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: 'center', gap: 20 }, missingTitle: { ...typography.h1 }, });
