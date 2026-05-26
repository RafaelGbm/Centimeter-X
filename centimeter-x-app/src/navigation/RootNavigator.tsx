import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { SplashView } from '../components/SplashView';
import { colors } from '../theme';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text },
};

export function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <SplashView />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
