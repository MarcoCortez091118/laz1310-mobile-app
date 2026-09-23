import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { usePathname, useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts, spacing } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const items: Array<{
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  route?: '/home' | '/radio';
}> = [
  { label: 'Inicio', icon: 'home-outline', iconActive: 'home', route: '/home' },
  { label: 'Noticias', icon: 'newspaper-outline', iconActive: 'newspaper' },
  { label: 'Radio', icon: 'radio-outline', iconActive: 'radio', route: '/radio' },
  { label: 'Explorar', icon: 'compass-outline', iconActive: 'compass' },
  { label: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active =
          item.route === '/home'
            ? pathname === '/home'
            : item.route === '/radio'
              ? pathname === '/radio'
              : false;
        const isRadio = item.label === 'Radio';

        return (
          <Pressable
            accessibilityRole="button"
            key={item.label}
            onPress={() => item.route && router.push(item.route)}
            style={({ pressed }) => [
              styles.item,
              { opacity: pressed && item.route ? 0.72 : 1 },
            ]}
          >
            <View style={[styles.iconWrap, isRadio && styles.radio]}>
              <Ionicons
                color={
                  isRadio
                    ? colors.white
                    : active
                      ? colors.red
                      : colors.gray
                }
                name={active ? item.iconActive : item.icon}
                size={isRadio ? 25 : 23}
              />
            </View>
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {item.label}
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
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 28,
    borderWidth: 1,
    height: 52,
    marginTop: -16,
    width: 52,
  },
  label: {
    color: colors.gray,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  activeLabel: {
    color: colors.red,
    fontFamily: fonts.bodySemiBold,
  },
});
