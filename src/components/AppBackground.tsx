import { PropsWithChildren } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

interface AppBackgroundProps extends PropsWithChildren {
  enabled?: boolean;
}

export function AppBackground({
  children,
  enabled = true,
}: AppBackgroundProps) {
  const { colors, preference } = useAppTheme();

  if (!enabled) {
    return (
      <View style={[styles.root, { backgroundColor: colors.black }]}>
        {children}
      </View>
    );
  }

  const imageOpacity = 1;
  const overlayColor =
    preference === 'dark'
      ? 'rgba(5,1,1,0.30)'
      : 'rgba(254,254,254,0.68)';

  return (
    <ImageBackground
      imageStyle={{ opacity: imageOpacity }}
      resizeMode="cover"
      source={require('../../assets/brand/Back.png')}
      style={[styles.root, { backgroundColor: colors.black }]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
