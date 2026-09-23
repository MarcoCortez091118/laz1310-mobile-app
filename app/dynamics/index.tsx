import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { dynamics } from '../../src/features/dynamics/data';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function participationLabel(type: 'form' | 'external_url') {
  return type === 'form' ? 'Formulario' : 'URL externa';
}

export default function DynamicsListScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Dinámicas" />

        <Text style={[styles.title, { color: colors.white }]}>
          Disponibles
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Participa en promociones, trivias, encuestas y activaciones de LA Z.
        </Text>

        <View style={styles.list}>
          {dynamics
            .filter((item) => item.status === 'active')
            .map((item) => (
              <Pressable
                accessibilityLabel={`Abrir dinámica ${item.title}`}
                accessibilityRole="button"
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: '/dynamics/[id]',
                    params: { id: item.id },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.76 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.artwork,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.artGlow,
                      { backgroundColor: colors.red },
                    ]}
                  />
                  <Text style={[styles.artLabel, { color: colors.red }]}>
                    {item.artworkLabel}
                  </Text>
                  <Text style={[styles.artBrand, { color: colors.white }]}>
                    LA Z
                  </Text>
                </View>

                <View style={styles.copy}>
                  <Text
                    numberOfLines={2}
                    style={[styles.itemTitle, { color: colors.white }]}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.deadline, { color: colors.red }]}>
                    {item.deadline}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.context, { color: colors.muted }]}
                  >
                    {item.context}
                  </Text>
                  <Text style={[styles.type, { color: colors.muted }]}>
                    {participationLabel(item.participationType)}
                  </Text>
                </View>

                <Ionicons
                  color={colors.white}
                  name="heart-outline"
                  size={24}
                  style={styles.heart}
                />
              </Pressable>
            ))}
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
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  list: {
    marginTop: spacing.lg,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 142,
    paddingVertical: 10,
  },
  artwork: {
    borderRadius: radii.md,
    borderWidth: 1,
    height: 112,
    overflow: 'hidden',
    padding: 12,
    width: 112,
  },
  artGlow: {
    borderRadius: 90,
    height: 130,
    opacity: 0.18,
    position: 'absolute',
    right: -46,
    top: -42,
    width: 130,
  },
  artLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  artBrand: {
    bottom: 12,
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    left: 12,
    position: 'absolute',
  },
  copy: {
    flex: 1,
    marginLeft: spacing.md,
    paddingRight: 38,
  },
  itemTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    lineHeight: 22,
  },
  deadline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 6,
  },
  context: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 3,
  },
  type: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 3,
  },
  heart: {
    position: 'absolute',
    right: 2,
    top: 20,
  },
});
