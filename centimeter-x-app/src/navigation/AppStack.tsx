import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { RoverDetailScreen } from '../screens/RoverDetailScreen';
import { RoverFormScreen } from '../screens/RoverFormScreen';
import { SessionStatusScreen } from '../screens/SessionStatusScreen';
import { NewOccurrenceScreen } from '../screens/NewOccurrenceScreen';
import type { AppStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgTop },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RoverDetail" component={RoverDetailScreen} options={{ title: 'Rover' }} />
      <Stack.Screen name="RoverForm" component={RoverFormScreen} options={{ title: 'Novo rover' }} />
      <Stack.Screen name="SessionStatus" component={SessionStatusScreen} options={{ title: 'Sessão de correção' }} />
      <Stack.Screen name="NewOccurrence" component={NewOccurrenceScreen} options={{ title: 'Nova ocorrência' }} />
    </Stack.Navigator>
  );
}
