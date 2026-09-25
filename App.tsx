import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppSplashScreen } from './src/components/UI/AppSplashScreen';
import { colors } from './src/theme/colors';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.rootContainer}>
          <StatusBar style="dark" backgroundColor={colors.white} />
          <HomeScreen />
          {showSplash && (
            <AppSplashScreen onFinish={() => setShowSplash(false)} />
          )}
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
