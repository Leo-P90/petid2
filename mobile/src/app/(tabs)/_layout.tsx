import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/app-state';
export default function TabLayout() {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return <Tabs backBehavior="history" screenOptions={{
    headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 12 },
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Ana Sayfa', tabBarAccessibilityLabel: 'Ana Sayfa', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>⌂</Text> }} />
    <Tabs.Screen name="health" options={{ title: 'Sağlık', tabBarAccessibilityLabel: 'Sağlık', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>＋</Text> }} />
    <Tabs.Screen name="match" options={{ title: 'PatiMatch', tabBarAccessibilityLabel: 'PatiMatch', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>♡</Text> }} />
    <Tabs.Screen name="services" options={{ title: 'Hizmetler', tabBarAccessibilityLabel: 'Hizmetler', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>◇</Text> }} />
  </Tabs>;
}
