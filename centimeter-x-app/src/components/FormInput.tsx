import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  secure?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function FormInput({ label, error, secure, icon, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textFaint} style={styles.leftIcon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={hidden}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  inputError: { borderColor: colors.danger },
  leftIcon: { marginRight: spacing.sm },
  input: { flex: 1, height: 52, color: colors.text, fontSize: fontSize.md },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  errorText: { color: colors.danger, fontSize: fontSize.xs, marginLeft: 4, fontWeight: '500' },
});
