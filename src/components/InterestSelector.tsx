import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserInterest } from '../features/auth/api';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

const options: Array<{
  value: UserInterest;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: 'radio', label: 'Radio', icon: 'radio-outline' },
  { value: 'news', label: 'Noticias', icon: 'newspaper-outline' },
  { value: 'events', label: 'Eventos', icon: 'calendar-outline' },
  { value: 'shows', label: 'Shows', icon: 'mic-outline' },
  { value: 'community', label: 'Comunidad', icon: 'people-outline' },
];

interface InterestSelectorProps {
  selected: UserInterest[];
  onChange: (selected: UserInterest[]) => void;
}

export function InterestSelector({ selected, onChange }: InterestSelectorProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            key={option.value}
            onPress={() =>
              onChange(
                active
                  ? selected.filter((item) => item !== option.value)
                  : [...selected, option.value],
              )
            }
            style={[
              styles.option,
              {
                backgroundColor: active ? colors.burgundy : colors.surfaceElevated,
                borderColor: active ? colors.red : colors.border,
              },
            ]}
          >
            <Ionicons
              color={active ? colors.red : colors.gray}
              name={option.icon}
              size={22}
            />
            <Text style={[styles.label, { color: colors.white }]}>
              {option.label}
            </Text>
            {active ? (
              <Ionicons color={colors.red} name="checkmark-circle" size={18} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
    marginTop: spacing.lg,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
});
