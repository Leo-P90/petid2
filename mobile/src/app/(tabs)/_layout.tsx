import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/app-state';
import { BrandIcon, fonts } from '../../components/brand';
import { secondaryText } from '../../core/theme';
export default function TabLayout() {
  const { colors, mode } = useApp(); const insets = useSafeAreaInsets(); const { fontScale } = useWindowDimensions();
  return <Tabs backBehavior="history" screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: secondaryText[mode], tabBarLabelStyle: { fontFamily: fonts.strong, fontSize: 11 }, tabBarItemStyle: { minHeight: 48, marginHorizontal: 2 },
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, elevation: 12, height: 60 + insets.bottom + Math.max(0, fontScale - 1) * 32, paddingHorizontal: 8, paddingBottom: 5 + insets.bottom, paddingTop: 6 },
  }}>
    {([{ name: 'index', title: 'Ana Sayfa', icon: 'home' }, { name: 'health', title: 'Sağlık', icon: 'heart' }, { name: 'match', title: 'PatiMatch', icon: 'paw' }, { name: 'services', title: 'Hizmetler', icon: 'briefcase' }] as const).map(item => <Tabs.Screen key={item.name} name={item.name} options={{ title: item.title, tabBarAccessibilityLabel: item.title, tabBarIcon: ({ color, focused }) => <View style={{ alignItems: 'center', gap: 2 }}><BrandIcon name={item.icon} color={typeof color === 'string' ? color : colors.accent} size={21}/>{focused ? <View style={{ width: 13, height: 3, borderRadius: 2, backgroundColor: colors.accent }} /> : null}</View> }} />)}
  </Tabs>;
}
