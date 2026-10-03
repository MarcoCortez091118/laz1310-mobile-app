import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNotifications } from '../features/notifications/NotificationsProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

export function ForegroundNotificationBanner() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { foregroundNotice, dismissForegroundNotice } = useNotifications();

  if (!foregroundNotice) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        dismissForegroundNotice();
        router.push('/notifications');
      }}
      style={[
        styles.banner,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.red }]}>
        <Ionicons color="#FEFEFE" name="notifications" size={18} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.white }]}>
          {foregroundNotice.title}
        </Text>
        <Text numberOfLines={2} style={[styles.body, { color: colors.muted }]}>
          {foregroundNotice.body}
        </Text>
      </View>
      <Pressable
        accessibilityLabel="Cerrar aviso"
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          dismissForegroundNotice();
        }}
      >
        <Ionicons color={colors.gray} name="close" size={20} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    left: spacing.md,
    padding: 12,
    position: 'absolute',
    right: spacing.md,
    top: 56,
    zIndex: 40,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: { flex: 1 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
});
