import { Tabs } from 'expo-router';
import { Home, Users, Receipt, Settings, Wallet } from 'lucide-react-native';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../src/theme';
import { useThemeStore } from '../../src/store/useThemeStore';

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useThemeColors();
  const isDark = useThemeStore((s) => s.scheme) === 'dark';
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        height: 72,
        borderRadius: 36,
        flexDirection: 'row',
        backgroundColor: isDark ? 'rgba(28, 25, 51, 0.55)' : 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 16,
      }}
    >
      <BlurView
        intensity={85}
        tint={isDark ? 'dark' : 'light'}
        style={{ ...StyleSheet.absoluteFillObject, borderRadius: 36, overflow: 'hidden' }}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        // expo-router maps `href: null` to a hidden tab via display:'none'.
        if (StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none') return null;

        const focused = state.index === index;
        const color = focused ? colors.content : colors.contentFaint;
        const label = typeof options.title === 'string' ? options.title : undefined;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            {options.tabBarIcon?.({ focused, color, size: 24 })}
            {label ? (
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 10, color, marginTop: 2 }}>
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isDark = useThemeStore((s) => s.scheme) === 'dark';
  // The FAB circle is `bg-content`, which is dark in light mode (→ white icon)
  // but light in dark mode (→ needs a dark icon to stay visible).
  const fabIconColor = isDark ? '#15132E' : colors.white;
  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.overview'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: t('tabs.groups'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          tabBarIcon: () => (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-content shadow-lg shadow-content/30">
              <Receipt size={22} color={fabIconColor} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: t('tabs.debts'),
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
