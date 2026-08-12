import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Snackbar } from '../components/Snackbar';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../theme/useAppTheme';
import type { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const status = useAuthStore(state => state.status);
  const { colors, isDark } = useAppTheme();

  if (status === 'loading') {
    return (
      <View style={[styles.boot, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        {status === 'authenticated' ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <Snackbar colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
