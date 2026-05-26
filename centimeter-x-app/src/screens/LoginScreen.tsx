import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';
import type { ApiError } from '../services/api';
import type { AuthStackParamList } from '../navigation/types';
import { MOCK_CREDENTIALS, USE_MOCK } from '../config/env';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    setFormError(null);
    if (emailErr || passErr) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setFormError((e as ApiError).message ?? 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>

          <FormInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            placeholder="voce@empresa.com"
            icon="mail-outline"
          />
          <FormInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secure
            placeholder="••••••••"
            icon="lock-closed-outline"
          />

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          {USE_MOCK && (
            <Pressable
              onPress={() => {
                setEmail(MOCK_CREDENTIALS.email);
                setPassword(MOCK_CREDENTIALS.password);
              }}
              style={styles.demoBox}
            >
              <Ionicons name="flask-outline" size={18} color={colors.accent} style={styles.demoIcon} />
              <View style={styles.demoTextWrap}>
                <Text style={styles.demoTitle}>Modo de teste — toque para preencher</Text>
                <Text style={styles.demoText}>
                  {MOCK_CREDENTIALS.email} · {MOCK_CREDENTIALS.password}
                </Text>
              </View>
            </Pressable>
          )}

          <PrimaryButton title="Entrar" onPress={onSubmit} loading={loading} icon="arrow-forward" style={styles.submit} />

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: spacing.lg },
  logoImage: { width: 220, height: 160 },
  formError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}14`,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  demoIcon: { marginRight: spacing.sm },
  demoTextWrap: { flex: 1 },
  demoTitle: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '700', marginBottom: 2 },
  demoText: { color: colors.textMuted, fontSize: fontSize.sm },
  submit: { marginTop: spacing.sm },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
});
