import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { colors } from '../theme/tokens';

interface VinylArtworkProps {
  size?: number;
  playing?: boolean;
}

export function VinylArtwork({
  size = 280,
  playing = false,
}: VinylArtworkProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!playing) {
      animationRef.current?.stop();
      return;
    }

    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 10_000,
        useNativeDriver: true,
      }),
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [playing, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderColor: playing ? colors.red : 'transparent',
        },
      ]}
    >
      <Animated.View
        style={{
          width: size - 8,
          height: size - 8,
          transform: [{ rotate }],
        }}
      >
        <Image
          source={require('../../assets/brand/vinyl-primary.png')}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
  },
});
