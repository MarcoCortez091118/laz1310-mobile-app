import {
  Image,
  ImageStyle,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

interface BrandLogoProps {
  variant?: 'negative' | 'positive';
  width?: number;
  style?: StyleProp<ViewStyle>;
}

const sources = {
  negative: require('../../assets/brand/logo-negative.png'),
  positive: require('../../assets/brand/logo-positive.png'),
};

export function BrandLogo({
  variant = 'negative',
  width = 118,
  style,
}: BrandLogoProps) {
  const imageStyle: ImageStyle = {
    width,
    height: width * 0.6,
    resizeMode: 'contain',
  };

  return (
    <View style={style}>
      <Image source={sources[variant]} style={imageStyle} />
    </View>
  );
}
