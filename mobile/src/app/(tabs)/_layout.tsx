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
    headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.white,
    tabBarActiveBackgroundColor: colors.greenDark, tabBarItemStyle: { borderRadius: 18, overflow: 'hidden', minHeight: 48, marginHorizontal: 2 },
    tabBarInactiveTintColor: secondaryText[mode], tabBarLabelStyle: { fontSize: 12 },
    tabBarStyle: { position: 'absolute', start: 12, end: 12, bottom: 12 + insets.bottom, backgroundColor: colors.nav, borderColor: colors.navBorder, borderTopColor: colors.navBorder, borderWidth: 1, borderRadius: 24, height: 66 + Math.max(0, fontScale - 1) * 32, paddingHorizontal: 7, paddingBottom: 7, paddingTop: 7, boxShadow: [{ offsetX: 0, offsetY: 10, blurRadius: 30, color: colors.shadow + '1F' }] },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Ana Sayfa', tabBarAccessibilityLabel: 'Ana Sayfa', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>⌂</Text> }} />
    <Tabs.Screen name="health" options={{ title: 'Sağlık', tabBarAccessibilityLabel: 'Sağlık', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>＋</Text> }} />
    <Tabs.Screen name="match" options={{ title: 'PatiMatch', tabBarAccessibilityLabel: 'PatiMatch', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>♡</Text> }} />
    <Tabs.Screen name="services" options={{ title: 'Hizmetler', tabBarAccessibilityLabel: 'Hizmetler', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 22 }}>◇</Text> }} />
  </Tabs>;
}
