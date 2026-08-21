import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowUpRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { Text } from '@/components/ui';

export function CategoryTile({
  title,
  image,
  index,
  onPress
}: {
  title: string;
  image: string;
  index: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Image source={image} style={styles.image} contentFit="cover" transition={180} />
      <View style={styles.overlay} />

      <View style={styles.top}>
        <Text style={styles.index}>{index}</Text>
        <ArrowUpRight size={18} color={colors.white} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 190,
    width: 145,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted
  },
  image: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.18)'
  },
  top: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  index: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.85
  },
  title: {
    position: 'absolute',
    left: 13,
    bottom: 14,
    ...typography.h3,
    color: colors.white
  }
});