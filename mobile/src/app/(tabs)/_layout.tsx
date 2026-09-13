import { Tabs } from 'expo-router';
import { Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/app-state';
import { secondaryText } from '../../core/theme';
export default function TabLayout() {
  const { colors, mode } = useApp();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return <Tabs backBehavior="history" screenOptions={{
    headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.accent,
    tabBarActiveBackgroundColor: colors.greenSoft, tabBarItemStyle: { borderRadius: 14, overflow: 'hidden', minHeight: 48, marginHorizontal: 2 },
    tabBarInactiveTintColor: secondaryText[mode], tabBarLabelStyle: { fontSize: 12 },
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 66 + insets.bottom + Math.max(0, fontScale - 1) * 32, paddingHorizontal: 7, paddingBottom: 7 + insets.bottom, paddingTop: 7 },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Ana Sayfa', tabBarAccessibilityLabel: 'Ana Sayfa', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>⌂</Text> }} />
    <Tabs.Screen name="health" options={{ title: 'Sağlık', tabBarAccessibilityLabel: 'Sağlık', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>＋</Text> }} />
    <Tabs.Screen name="match" options={{ title: 'PatiMatch', tabBarAccessibilityLabel: 'PatiMatch', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>♡</Text> }} />
    <Tabs.Screen name="services" options={{ title: 'Hizmetler', tabBarAccessibilityLabel: 'Hizmetler', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>◇</Text> }} />
  </Tabs>;
}
