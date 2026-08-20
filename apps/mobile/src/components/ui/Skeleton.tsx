import { View, type ViewStyle } from 'react-native';
import { colors } from '../../theme';

type Props = { width?: number | string; height: number; radius?: number; style?: ViewStyle };

export function Skeleton({ width = '100%', height, radius = 6, style }: Props) {
  return <View style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceMuted }, style]} />;
}
