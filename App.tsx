import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppSplashScreen } from './src/components/UI/AppSplashScreen';
import { ErrorBoundary } from './src/components/UI/ErrorBoundary';
import { colors } from './src/theme/colors';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function preloadAssets() {
      try {
        // Preload Ionicons font so all vector icons render smoothly
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn('Font loading non-fatal warning:', e);
      }
    }

    preloadAssets();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <View style={styles.rootContainer}>
            <StatusBar style="dark" backgroundColor={colors.white} />
            <HomeScreen />
            {showSplash && (
              <AppSplashScreen onFinish={() => setShowSplash(false)} />
            )}
          </View>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
