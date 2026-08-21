import { View, type DimensionValue, type ViewStyle } from 'react-native';
import { colors } from '../../theme';

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
  style
}: Props) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceMuted
        },
        style
      ]}
    />
  );
}