import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { TimelineScreen } from '../screens/timeline/TimelineScreen';
import { AddEventScreen } from '../screens/timeline/AddEventScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ChatHistoryScreen } from '../screens/chat/ChatHistoryScreen';
import { ChatThreadScreen } from '../screens/chat/ChatThreadScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { UploadReportScreen } from '../screens/reports/UploadReportScreen';
import { MedicationsScreen } from '../screens/medications/MedicationsScreen';
import { AddMedicationScreen } from '../screens/medications/AddMedicationScreen';
import { VitalsScreen } from '../screens/vitals/VitalsScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={{ fontSize: 20 }}>{icon}</Text>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarLabelStyle: styles.tabLabel,
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
    />
    <Tab.Screen
      name="TimelineTab"
      component={TimelineScreen}
      options={{ tabBarLabel: 'Timeline', tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} /> }}
    />
    <Tab.Screen
      name="ChatTab"
      component={ChatScreen}
      options={{ tabBarLabel: 'AI Chat', tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} /> }}
    />
    <Tab.Screen
      name="ReportsTab"
      component={ReportsScreen}
      options={{ tabBarLabel: 'Reports', tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} /> }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
    <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MedicationsTab" component={MedicationsScreen} options={{ title: 'Medications' }} />
    <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ title: 'Add Medication' }} />
    <Stack.Screen name="VitalsTab" component={VitalsScreen} options={{ title: 'Vitals' }} />
    <Stack.Screen name="InsightsTab" component={InsightsScreen} options={{ title: 'Insights' }} />
    <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
    <Stack.Screen name="UploadReport" component={UploadReportScreen} options={{ title: 'Upload Report' }} />
  </Stack.Navigator>
);

// Loading screen
const LoadingScreen = () => (
  <View style={styles.loading}>
    <Text style={{ fontSize: 48 }}>🔬</Text>
    <Text style={styles.loadingText}>LifeLens</Text>
  </View>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tabLabel: { ...typography.small, marginTop: 2 },
  tabIcon: { padding: 4 },
  tabIconActive: { transform: [{ scale: 1.1 }] },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { ...typography.h1, color: colors.primary, marginTop: 12 },
});
