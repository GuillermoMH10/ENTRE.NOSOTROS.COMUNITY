import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppSplashScreen } from './src/components/UI/AppSplashScreen';
import { ErrorBoundary } from './src/components/UI/ErrorBoundary';
import { colors } from './src/theme/colors';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Register PWA Service Worker on Web browsers
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Entre Nosotros PWA ServiceWorker registrado:', registration.scope);
          })
          .catch((error) => {
            console.log('Entre Nosotros PWA ServiceWorker registro falló:', error);
          });
      });
    }
  }, []);

  // Load vector icon fonts directly from local assets with fallbacks for standalone Android APKs
  const [fontsLoaded] = useFonts({
    ionicons: require('./assets/fonts/Ionicons.ttf'),
    Ionicons: require('./assets/fonts/Ionicons.ttf'),
    ...Ionicons.font,
  });

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
