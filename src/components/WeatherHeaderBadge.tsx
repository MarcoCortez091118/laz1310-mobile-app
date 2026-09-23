import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii } from '../theme/tokens';

export function WeatherHeaderBadge() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Abrir clima"
      accessibilityRole="button"
      onPress={() => router.push('/weather')}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Ionicons color={colors.red} name="partly-sunny" size={16} />
      <Text style={[styles.temperature, { color: colors.white }]}> 
        64°
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  temperature: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});
