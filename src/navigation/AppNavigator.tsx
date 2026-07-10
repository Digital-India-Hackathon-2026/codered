import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';

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

const TAB_ICONS: Record<string, string> = {
  HomeTab: 'home',
  TimelineTab: 'clock',
  ChatTab: 'message-circle',
  ReportsTab: 'file-text',
  ProfileTab: 'user',
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarLabelStyle: styles.tabLabel,
      tabBarHideOnKeyboard: true,
      tabBarIcon: ({ focused }) => (
        <FeatherIcon
          name={TAB_ICONS[route.name] || 'circle'}
          size={20}
          color={focused ? colors.primary : colors.textTertiary}
        />
      ),
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="TimelineTab" component={TimelineScreen} options={{ tabBarLabel: 'Timeline' }} />
    <Tab.Screen name="ChatTab" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
    <Tab.Screen name="ReportsTab" component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
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
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    <Stack.Screen name="MedicationsTab" component={MedicationsScreen} />
    <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
    <Stack.Screen name="VitalsTab" component={VitalsScreen} />
    <Stack.Screen name="InsightsTab" component={InsightsScreen} />
    <Stack.Screen name="AddEvent" component={AddEventScreen} />
    <Stack.Screen name="UploadReport" component={UploadReportScreen} />
  </Stack.Navigator>
);

const LoadingScreen = () => (
  <View style={styles.loading}>
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
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { ...typography.screenTitle, color: colors.text },
});
