import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, spacing } from '../../src/theme/tokens';

export default function DynamicsConfirmationScreen() {
  const router = useRouter();
  const { title, receiptId, submittedAt } = useLocalSearchParams<{
    title?: string;
    receiptId?: string;
    submittedAt?: string;
  }>();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: colors.black }]}
    >
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.red }]}>
          <Ionicons color="#FEFEFE" name="checkmark" size={42} />
        </View>

        <Text style={[styles.title, { color: colors.white }]}>
          Participación recibida
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          {title
            ? 'Tu participación para “' + title + '” fue aceptada por LA Z API.'
            : 'Tu participación fue aceptada por LA Z API.'}
        </Text>
        {submittedAt ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            Recibida {new Date(submittedAt).toLocaleString('es-US')}
          </Text>
        ) : null}
        {receiptId ? (
          <Text
            numberOfLines={1}
            style={[styles.receipt, { color: colors.muted }]}
          >
            Recibo: {receiptId}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Volver a Dinámicas"
            onPress={() => router.replace('/dynamics')}
          />
          <PrimaryButton
            label="Volver a Inicio"
            onPress={() => router.replace('/home')}
            secondary
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 48,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    marginTop: 28,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
    textAlign: 'center',
  },
  receipt: {
    fontFamily: fonts.body,
    fontSize: 9,
    marginTop: 6,
    maxWidth: '90%',
  },
  actions: {
    gap: 10,
    marginTop: 34,
    width: '100%',
  },
});
