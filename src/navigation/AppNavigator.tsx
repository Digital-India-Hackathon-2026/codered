import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/shared/Icon';
import { colors, typography, shadows } from '../theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { AmaDetailScreen } from '../screens/feed/AmaDetailScreen';
import { CommunityDetailScreen } from '../screens/feed/CommunityDetailScreen';
import { CreatePostScreen } from '../screens/feed/CreatePostScreen';
import { BloodRequestDetailScreen } from '../screens/feed/BloodRequestDetailScreen';
import { CreateBloodRequestScreen } from '../screens/feed/CreateBloodRequestScreen';
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
import { SplashScreen } from '../screens/splash/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<string, { icon: string; label: string }> = {
  HomeTab: { icon: 'House', label: 'Home' },
  ChatTab: { icon: 'ChatCircle', label: 'Vita' },
  VitalsTab: { icon: 'Heartbeat', label: 'Vitals' },
  TimelineTab: { icon: 'Compass', label: 'Discover' },
  ProfileTab: { icon: 'User', label: 'Profile' },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.coral,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarLabelStyle: styles.tabLabel,
      tabBarHideOnKeyboard: true,
      tabBarIcon: ({ focused }) => (
        <Icon
          name={TAB_CONFIG[route.name]?.icon || 'Circle'}
          size={22}
          color={focused ? colors.coral : colors.textTertiary}
          weight={focused ? 'fill' : 'duotone'}
        />
      ),
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="ChatTab" component={ChatScreen} options={{ tabBarLabel: 'Vita' }} />
    <Tab.Screen name="VitalsTab" component={VitalsScreen} options={{ tabBarLabel: 'Vitals' }} />
    <Tab.Screen name="TimelineTab" component={FeedScreen} options={{ tabBarLabel: 'Discover' }} />
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
    <Stack.Screen name="InsightsTab" component={InsightsScreen} />
    <Stack.Screen name="AddEvent" component={AddEventScreen} />
    <Stack.Screen name="UploadReport" component={UploadReportScreen} />
    <Stack.Screen name="ReportsTab" component={ReportsScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="AmaDetail" component={AmaDetailScreen} />
    <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="BloodRequestDetail" component={BloodRequestDetailScreen} />
    <Stack.Screen name="CreateBloodRequest" component={CreateBloodRequestScreen} />
  </Stack.Navigator>
);

const LoadingScreen = () => <SplashScreen />;

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
  tabLabel: { fontSize: 10, fontWeight: '500', marginTop: 2 },

});
