import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight, Play } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';
import { HomeHeader } from '@/components/navigation/HomeHeader';
import { SectionHeader } from '@/components/home/SectionHeader';
import { CategoryTile } from '@/components/home/CategoryTile';
import { EditorialBanner } from '@/components/home/EditorialBanner';
import { ProductCard } from '@/components/product/ProductCard';

const products = [
  { id: '1', name: 'Form Desk Lamp', category: 'Lighting', price: '$128', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85' },
  { id: '2', name: 'Arc Ceramic Vessel', category: 'Objects', price: '$64', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=85' },
  { id: '3', name: 'Field Chronograph', category: 'Watches', price: '$295', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=85' },
  { id: '4', name: 'Everyday Leather Tote', category: 'Accessories', price: '$180', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85' },
];

const categories = [
  { title: 'Objects', index: '01', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=85' },
  { title: 'Wear', index: '02', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=85' },
  { title: 'Time', index: '03', image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=85' },
  { title: 'Living', index: '04', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <HomeHeader />

      <View style={styles.intro}>
        <Text style={styles.kicker}>THE NEW EDIT / AUTUMN 2026</Text>
        <Text style={styles.title}>Objects with intention.</Text>
        <Text style={styles.subtitle}>A considered selection of things made to be used, lived with and kept.</Text>
      </View>

      <Pressable style={styles.hero}>
        <Image source="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=88" style={styles.heroImage} contentFit="cover" transition={220} />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <View style={styles.heroTop}><Text style={styles.heroKicker}>FEATURED COLLECTION</Text><View style={styles.play}><Play size={13} color={colors.white} fill={colors.white} /></View></View>
          <View>
            <Text style={styles.heroTitle}>Quiet forms.{`\n`}Better essentials.</Text>
            <View style={styles.heroLink}><Text style={styles.heroLinkText}>Explore the edit</Text><ArrowRight size={17} color={colors.white} /></View>
          </View>
        </View>
      </Pressable>

      <View style={styles.section}>
        <SectionHeader title="Shop by mood" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {categories.map((category) => <CategoryTile key={category.index} {...category} />)}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="New arrivals" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRail}>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </ScrollView>
      </View>

      <EditorialBanner />

      <View style={styles.manifesto}>
        <Text style={styles.manifestoKicker}>WHY ORYN</Text>
        <Text style={styles.manifestoTitle}>Less noise. More things worth keeping.</Text>
        <Text style={styles.manifestoBody}>We look for honest materials, useful forms and details that reward a second look. Nothing added without a reason.</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Most wanted" />
        <View style={styles.grid}>
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 120 },
  intro: { marginBottom: spacing.xl },
  kicker: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  title: { ...typography.display, color: colors.text, maxWidth: 340 },
  subtitle: { ...typography.body, color: colors.textSecondary, maxWidth: 320, marginTop: spacing.md },
  hero: { height: 470, overflow: 'hidden', position: 'relative', backgroundColor: '#303733', marginBottom: spacing.xxxl },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,18,16,0.34)' },
  heroContent: { position: 'absolute', left: spacing.xl, right: spacing.xl, top: spacing.xl, bottom: spacing.xl, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroKicker: { ...typography.label, color: colors.white, opacity: 0.82 },
  play: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  heroTitle: { ...typography.display, color: colors.white, fontSize: 35, lineHeight: 40 },
  heroLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg },
  heroLinkText: { ...typography.bodyMedium, color: colors.white },
  section: { marginBottom: spacing.xxxl },
  rail: { gap: 10, paddingRight: spacing.lg },
  productRail: { gap: spacing.md, paddingRight: spacing.lg },
  manifesto: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.xxxl, marginBottom: spacing.xxxl },
  manifestoKicker: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
  manifestoTitle: { ...typography.h1, color: colors.text, maxWidth: 340 },
  manifestoBody: { ...typography.body, color: colors.textSecondary, maxWidth: 340, marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
});
