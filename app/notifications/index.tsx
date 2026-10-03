import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { InboxItem } from '../../src/features/notifications/api';
import { useNotifications } from '../../src/features/notifications/NotificationsProvider';
import { safeNotificationRoute } from '../../src/features/notifications/routing';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function dateLabel(value: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const { colors } = useAppTheme();
  const {
    inbox,
    nextCursor,
    unreadCount,
    loading,
    error,
    refreshInbox,
    loadMoreInbox,
    markRead,
    markAllRead,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refreshInbox();
    } finally {
      setRefreshing(false);
    }
  };

  const openItem = async (item: InboxItem) => {
    if (!item.readAt) {
      try {
        await markRead(item.id);
      } catch {
        // The target can still be opened if marking the inbox item fails.
      }
    }

    const route = safeNotificationRoute(item.target.value);
    router.push((route ?? '/home') as Href);
  };

  const readAll = async () => {
    if (working || unreadCount === 0) return;
    setWorking(true);
    try {
      await markAllRead();
    } finally {
      setWorking(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.black }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />
        }
      >
        <ScreenHeader title="Notificaciones" />

        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={[styles.title, { color: colors.white }]}>Centro de avisos</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <Pressable disabled={working} onPress={() => void readAll()}>
              <Text style={[styles.readAll, { color: colors.red }]}>Marcar todo leído</Text>
            </Pressable>
          ) : null}
        </View>

        {loading && inbox.length === 0 ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>Cargando avisos…</Text>
          </View>
        ) : null}

        {!loading && inbox.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Ionicons color={colors.red} name="notifications-outline" size={34} />
            <Text style={[styles.emptyTitle, { color: colors.white }]}>Sin notificaciones</Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>Los avisos que recibas aparecerán aquí.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {inbox.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => void openItem(item)}
              style={[
                styles.item,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: item.readAt ? colors.border : colors.red,
                },
              ]}
            >
              <View style={[styles.itemIcon, { backgroundColor: colors.burgundy }]}>
                <Ionicons
                  color={colors.red}
                  name={item.type === 'radio' ? 'radio-outline' : item.type === 'dynamics' ? 'trophy-outline' : 'notifications-outline'}
                  size={20}
                />
              </View>
              <View style={styles.itemCopy}>
                <View style={styles.itemTitleRow}>
                  <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.white }]}>
                    {item.title}
                  </Text>
                  {!item.readAt ? <View style={[styles.dot, { backgroundColor: colors.red }]} /> : null}
                </View>
                <Text style={[styles.itemBody, { color: colors.muted }]}>{item.body}</Text>
                <Text style={[styles.itemDate, { color: colors.gray }]}>{dateLabel(item.createdAt)}</Text>
              </View>
              <Ionicons color={colors.gray} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>

        {nextCursor ? (
          <Pressable
            disabled={working}
            onPress={() => void loadMoreInbox()}
            style={[styles.more, { borderColor: colors.border }]}
          >
            <Text style={[styles.moreText, { color: colors.white }]}>Cargar más</Text>
          </Pressable>
        ) : null}

        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  headingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  headingCopy: { flex: 1 },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  readAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    marginBottom: 2,
  },
  state: {
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.xl,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  empty: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
    marginTop: 10,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 4,
  },
  list: {
    gap: 10,
    marginTop: spacing.lg,
  },
  item: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 86,
    padding: 12,
  },
  itemIcon: {
    alignItems: 'center',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  itemCopy: { flex: 1 },
  itemTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  itemTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  dot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  itemBody: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  itemDate: {
    fontFamily: fonts.body,
    fontSize: 8,
    marginTop: 6,
  },
  more: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 14,
    paddingVertical: 12,
  },
  moreText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
    textAlign: 'center',
  },
});
