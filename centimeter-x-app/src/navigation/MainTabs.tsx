import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RoverListScreen } from '../screens/RoverListScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { useAuth } from '../context/AuthContext';
import type { MainTabParamList } from './types';
import { colors, fontSize, radius, spacing } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid',
  Rovers: 'hardware-chip',
  History: 'time',
};

function HeaderBrand() {
  return (
    <View style={styles.brandWrap}>
      <Image source={require('../../assets/logo mini.png')} style={styles.brandLogo} resizeMode="contain" />
    </View>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={logout} hitSlop={8} style={styles.logout}>
      <Ionicons name="log-out-outline" size={20} color={colors.primary} />
      <Text style={styles.logoutText}>Sair</Text>
    </Pressable>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTitleAlign: 'center',
        headerTitleContainerStyle: { left: 0, right: 0 },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerLeft: () => <HeaderBrand />,
        headerLeftContainerStyle: { paddingLeft: spacing.md },
        headerRight: () => <LogoutButton />,
        headerRightContainerStyle: { paddingRight: spacing.md },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused, size }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <Ionicons name={ICONS[route.name]} size={size - 2} color={color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerTitle: '', tabBarLabel: 'Início' }} />
      <Tab.Screen name="Rovers" component={RoverListScreen} options={{ title: 'Rovers' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.bgTop },
  headerTitle: { color: colors.text, fontWeight: '800', fontSize: fontSize.lg },
  brandWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  brandLogo: { width: 80, height: 80 },
  logout: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.md, marginLeft: 4 },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabLabel: { fontSize: fontSize.xs, fontWeight: '600' },
  tabIcon: { padding: 6, borderRadius: radius.md },
  tabIconActive: { backgroundColor: `${colors.primary}1F` },
});
