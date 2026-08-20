import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii } from '@/theme';

interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  variant?: 'default' | 'filled';
  style?: ViewStyle;
}

export function IconButton({ icon: Icon, onPress, label, variant = 'default', style }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}>
      <Icon size={20} color={variant === 'filled' ? colors.white : colors.text} strokeWidth={1.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radii.md },
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  filled: { backgroundColor: colors.accent, borderColor: colors.accent },
  pressed: { opacity: 0.78 }
});
