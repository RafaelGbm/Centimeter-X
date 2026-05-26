import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateName, validatePassword } from '../utils/validators';
import type { ApiError } from '../services/api';
import type { AuthStackParamList } from '../navigation/types';
import { colors, fontSize, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ name: nameErr, email: emailErr, password: passErr });
    setFormError(null);
    if (nameErr || emailErr || passErr) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      const err = e as ApiError;
      setFormError(err.status === 409 ? 'Este e-mail já está cadastrado.' : err.message);
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
          <View style={styles.header}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece a usar o Centimeter-X</Text>
          </View>

          <FormInput label="Nome" value={name} onChangeText={setName} error={errors.name} placeholder="Seu nome" icon="person-outline" autoCapitalize="words" />
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
            placeholder="mínimo 8 caracteres"
            icon="lock-closed-outline"
          />

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          <PrimaryButton title="Cadastrar" onPress={onSubmit} loading={loading} icon="checkmark" style={styles.submit} />

          <Pressable onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Já tenho conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  formError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.sm },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
});
