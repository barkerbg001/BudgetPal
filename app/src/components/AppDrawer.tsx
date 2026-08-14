import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import {
  History,
  House,
  LogOut,
  Mail,
  Settings,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useAppTheme } from '../theme/useAppTheme';

type DrawerDestination = 'Dashboard' | 'History' | 'Settings';

type Props = {
  navigation: NavigationProp<AppStackParamList>;
  current: DrawerDestination;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

const NAV_ITEMS: {
  key: DrawerDestination;
  label: string;
  Icon: typeof House;
}[] = [
  { key: 'Dashboard', label: 'Home', Icon: House },
  { key: 'History', label: 'History', Icon: History },
  { key: 'Settings', label: 'Settings', Icon: Settings },
];

export function AppDrawer({ navigation, current }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const drawerOpen = useUiStore(state => state.drawerOpen);
  const closeDrawer = useUiStore(state => state.closeDrawer);
  const [visible, setVisible] = useState(drawerOpen);
  const progress = useRef(new Animated.Value(drawerOpen ? 1 : 0)).current;

  useEffect(() => {
    if (drawerOpen) {
      setVisible(true);
    }
    Animated.timing(progress, {
      toValue: drawerOpen ? 1 : 0,
      duration: drawerOpen ? 260 : 200,
      easing: drawerOpen
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !drawerOpen) {
        setVisible(false);
      }
    });
  }, [drawerOpen, progress]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => sub.remove();
  }, [closeDrawer, drawerOpen]);

  if (!visible) {
    return null;
  }

  function goTo(route: DrawerDestination) {
    closeDrawer();
    if (route !== current) {
      navigation.navigate(route);
    }
  }

  function onLogout() {
    closeDrawer();
    logout().catch(() => undefined);
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        onPress={closeDrawer}
        style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-DRAWER_WIDTH, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.profile}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accent + '22' },
            ]}>
            <User color={colors.accent} size={22} />
          </View>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {user?.name ?? 'User'}
          </Text>
          <View style={styles.emailRow}>
            <Mail color={colors.muted} size={13} />
            <Text
              style={[styles.email, { color: colors.muted }]}
              numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map(item => {
            const selected = current === item.key;
            const color = selected ? colors.accent : colors.text;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => goTo(item.key)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: selected
                      ? colors.accent + '18'
                      : 'transparent',
                  },
                ]}>
                <item.Icon color={color} size={20} strokeWidth={2} />
                <Text style={[styles.navLabel, { color }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={onLogout}
            style={styles.navItem}>
            <LogOut color={colors.error} size={20} />
            <Text style={[styles.navLabel, { color: colors.error }]}>
              Log out
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  sheet: {
    width: DRAWER_WIDTH,
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  profile: {
    paddingHorizontal: 8,
    paddingBottom: 20,
    gap: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    flex: 1,
    fontSize: 13,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
});
