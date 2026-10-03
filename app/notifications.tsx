import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../src/components/ScreenHeader';
import { useAuth } from '../src/features/auth/AuthProvider';
import { InboxItem } from '../src/features/notifications/api';
import { useNotifications } from '../src/features/notifications/NotificationsProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

const categoryLabels: Record<InboxItem['type'], string> = {
  general: 'GENERAL',
  radio: 'RADIO',
  programs: 'PROGRAMAS',
  dynamics: 'DINÁMICAS',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const {
    inbox,
    unreadCount,
    loading,
    error,
    hasMore,
    refreshInbox,
    loadMore,
    markAllRead,
    openNotification,
  } = useNotifications();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (status === 'signedOut') {
      router.replace('/auth');
    }
  }, [router, status]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <ScreenHeader title="Notificaciones" />

        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.title, { color: colors.white }]}>Tu inbox</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {unreadCount === 0
                ? 'No tienes avisos pendientes.'
                : `${unreadCount} ${unreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}.`}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <Pressable onPress={() => void markAllRead()} style={styles.markAll}>
              <Text style={[styles.markAllText, { color: colors.red }]}>Marcar todo leído</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          onRefresh={() => void refreshInbox()}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
        >
          {inbox.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => void openNotification(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: item.readAt ? colors.border : colors.red,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.categoryRow}>
                  {!item.readAt ? <View style={[styles.dot, { backgroundColor: colors.red }]} /> : null}
                  <Text style={[styles.category, { color: item.readAt ? colors.muted : colors.red }]}>
                    {categoryLabels[item.type]}
                  </Text>
                </View>
                <Text style={[styles.date, { color: colors.muted }]}>{formatDate(item.createdAt)}</Text>
              </View>

              <Text style={[styles.cardTitle, { color: colors.white }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{item.body}</Text>

              <View style={styles.openRow}>
                <Text style={[styles.openText, { color: colors.red }]}>Abrir</Text>
                <Ionicons color={colors.red} name="arrow-forward" size={15} />
              </View>
            </Pressable>
          ))}

          {!loading && inbox.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons color={colors.muted} name="notifications-off-outline" size={36} />
              <Text style={[styles.emptyTitle, { color: colors.white }]}>Aún no hay notificaciones</Text>
              <Text style={[styles.emptyBody, { color: colors.muted }]}>Los avisos de LA Z aparecerán aquí aunque no tengas push activo.</Text>
            </View>
          ) : null}

          {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

          {hasMore ? (
            <Pressable onPress={() => void loadMore()} style={styles.loadMore}>
              <Text style={[styles.loadMoreText, { color: colors.red }]}>Cargar más</Text>
            </Pressable>
          ) : null}

          {loading && inbox.length === 0 ? <ActivityIndicator color={colors.red} /> : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.md },
  headingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 30 },
  subtitle: { fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  markAll: { paddingBottom: 2, paddingLeft: 12, paddingVertical: 8 },
  markAllText: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
  list: { gap: 10, paddingBottom: 80, paddingTop: spacing.md },
  card: { borderRadius: radii.md, borderWidth: 1, padding: spacing.md },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  dot: { borderRadius: 4, height: 7, width: 7 },
  category: { fontFamily: fonts.bodyBold, fontSize: 8, letterSpacing: 0.7 },
  date: { fontFamily: fonts.body, fontSize: 8 },
  cardTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, marginTop: 10 },
  body: { fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 4 },
  openRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 12 },
  openText: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
  empty: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 64 },
  emptyTitle: { fontFamily: fonts.displayExtraBold, fontSize: 24, marginTop: 14 },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    textAlign: 'center',
  },
  error: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16, marginTop: 14 },
  loadMore: { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
