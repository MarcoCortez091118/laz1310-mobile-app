import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

const rows = [
  ['Programas favoritos', 'Tus shows y hosts seguidos', 'heart-outline'],
  ['Noticias guardadas', 'Artículos para leer después', 'bookmark-outline'],
  ['Eventos guardados', 'Fechas y recordatorios', 'calendar-outline'],
  ['Notificaciones', 'Configura qué avisos recibes', 'notifications-outline'],
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>
          Perfil
        </Text>

        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.red }]}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.white }]}>
              Marco
            </Text>
            <Text style={[styles.city, { color: colors.muted }]}>
              Detroit, MI
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Editar perfil"
          onPress={() => {}}
          secondary
        />

        <View style={styles.stats}>
          {[
            ['3', 'Programas'],
            ['8', 'Guardados'],
            ['2', 'Eventos'],
          ].map(([value, label]) => (
            <View key={label} style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.white }]}>
                {value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>
          Tu contenido
        </Text>

        <View style={styles.rows}>
          {rows.map(([title, subtitle, icon]) => (
            <Pressable
              key={title}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons color={colors.red} name={icon} size={21} />
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>
                  {title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {subtitle}
                </Text>
              </View>
              <Ionicons color={colors.gray} name="chevron-forward" size={20} />
            </Pressable>
          ))}

          <Pressable
            onPress={() => router.push('/profile/settings')}
            style={[
              styles.row,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="settings-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>
                Configuración
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                Apariencia y preferencias de la app
              </Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 180,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 36,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarText: {
    color: '#FEFEFE',
    fontFamily: fonts.displayExtraBold,
    fontSize: 38,
  },
  profileCopy: {
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  city: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
  },
  rows: {
    gap: 10,
    marginTop: 12,
  },
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: spacing.md,
  },
  rowCopy: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
});
