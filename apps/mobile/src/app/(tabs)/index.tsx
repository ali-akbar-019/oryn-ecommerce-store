import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ORYN</Text>
        <Text style={styles.title}>Objects with intention.</Text>
        <Text style={styles.subtitle}>A considered selection of products for everyday living.</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>THE NEW EDIT</Text>
        <Text style={styles.heroTitle}>Quiet forms. Better essentials.</Text>
        <Text style={styles.heroBody}>Explore the latest arrivals, selected for design, utility and lasting appeal.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New arrivals</Text>
        <View style={styles.placeholderRow}>
          {[1, 2].map((item) => <View key={item} style={styles.productPlaceholder} />)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.huge },
  header: { marginBottom: spacing.xxxl },
  eyebrow: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  title: { ...typography.display, color: colors.text, maxWidth: 340 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg, maxWidth: 330 },
  hero: { backgroundColor: colors.accent, minHeight: 360, padding: spacing.xl, justifyContent: 'flex-end', marginBottom: spacing.xxxl },
  heroEyebrow: { ...typography.label, color: colors.white, opacity: 0.7, marginBottom: spacing.md },
  heroTitle: { ...typography.h1, color: colors.white, maxWidth: 300 },
  heroBody: { ...typography.body, color: colors.white, opacity: 0.8, marginTop: spacing.md, maxWidth: 300 },
  section: { marginBottom: spacing.xxxl },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  placeholderRow: { flexDirection: 'row', gap: spacing.md },
  productPlaceholder: { flex: 1, aspectRatio: 0.78, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border }
});
