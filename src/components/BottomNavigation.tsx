import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { usePathname, useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, spacing } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const items: Array<{
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  route?: '/home' | '/radio' | '/explore' | '/profile';
}> = [
  { label: 'Inicio', icon: 'home-outline', iconActive: 'home', route: '/home' },
  { label: 'Noticias', icon: 'newspaper-outline', iconActive: 'newspaper' },
  { label: 'Radio', icon: 'radio-outline', iconActive: 'radio', route: '/radio' },
  { label: 'Explorar', icon: 'compass-outline', iconActive: 'compass', route: '/explore' },
  { label: 'Perfil', icon: 'person-outline', iconActive: 'person', route: '/profile' },
];

function isActive(pathname: string, route?: string) {
  if (!route) {
    return false;
  }

  if (route === '/home') {
    return pathname === '/home';
  }

  if (route === '/explore') {
    return pathname === '/explore' || pathname.startsWith('/dynamics');
  }

  if (route === '/profile') {
    return pathname === '/profile' || pathname.startsWith('/profile/');
  }

  return pathname === route;
}

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.black,
          borderTopColor: colors.border,
        },
      ]}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.route);
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
            <View
              style={[
                styles.iconWrap,
                isRadio && styles.radio,
                isRadio && {
                  backgroundColor: colors.red,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                color={
                  isRadio
                    ? '#FEFEFE'
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
                { color: active ? colors.red : colors.gray },
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
    borderRadius: 28,
    borderWidth: 1,
    height: 52,
    marginTop: -16,
    width: 52,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
  },
  activeLabel: {
    fontFamily: fonts.bodySemiBold,
  },
});
