import React from 'react';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

const App = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
};

export default App;
