import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowUpRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function EditorialBanner() {
  return (
    <Pressable style={styles.banner}>
      <Image source="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=85" style={styles.image} contentFit="cover" transition={180} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.topRow}><Text style={styles.eyebrow}>ORYN JOURNAL / 01</Text><ArrowUpRight size={19} color={colors.white} /></View>
        <Text style={styles.title}>The art of choosing less.</Text>
        <Text style={styles.body}>A closer look at considered objects, enduring materials and everyday rituals.</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { height: 330, overflow: 'hidden', position: 'relative', backgroundColor: '#29302d' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,18,16,0.42)' },
  content: { position: 'absolute', left: spacing.xl, right: spacing.xl, top: spacing.xl, bottom: spacing.xl, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { ...typography.label, color: colors.white, opacity: 0.82 },
  title: { ...typography.display, color: colors.white, maxWidth: 300, fontSize: 32, lineHeight: 37 },
  body: { ...typography.body, color: colors.white, opacity: 0.86, maxWidth: 300 },
});
