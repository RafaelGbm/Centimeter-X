import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients, spacing } from '../theme';

interface Props {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({ children, padded = true, style, edges = ['top', 'left', 'right'] }: Props) {
  return (
    <LinearGradient colors={gradients.background} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1 },
  padded: { padding: spacing.lg },
});
