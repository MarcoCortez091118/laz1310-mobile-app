import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing } from '../theme/tokens';

const items = [
  ['⌂', 'Inicio'],
  ['▤', 'Noticias'],
  ['▶', 'Radio'],
  ['◇', 'Explorar'],
  ['○', 'Perfil'],
] as const;

export function BottomNavigation() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {items.map(([icon, label]) => {
        const isHome = label === 'Inicio';
        const isRadio = label === 'Radio';

        return (
          <Pressable
            key={label}
            onPress={() => {
              if (isRadio) {
                router.push('/radio');
              }
            }}
            style={styles.item}
          >
            <View style={[styles.iconWrap, isRadio && styles.radio]}>
              <Text
                style={[
                  styles.icon,
                  (isHome || isRadio) && styles.active,
                  isRadio && styles.radioIcon,
                ]}
              >
                {icon}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                isHome ? styles.active : null,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 84,
    justifyContent: 'space-around',
    left: 0,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: 0,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 58,
  },
  iconWrap: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  radio: {
    backgroundColor: colors.red,
    borderRadius: 28,
    height: 52,
    marginTop: -16,
    width: 52,
  },
  icon: {
    color: colors.gray,
    fontSize: 22,
  },
  radioIcon: {
    color: colors.white,
  },
  label: {
    color: colors.gray,
    fontSize: 10,
  },
  active: {
    color: colors.red,
    fontWeight: '800',
  },
});
