import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AppSplashScreen } from './src/components/UI/AppSplashScreen';
import { colors } from './src/theme/colors';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Preload all vector icon fonts so they are 100% available in production standalone APKs
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.rootContainer}>
          <StatusBar style="dark" backgroundColor={colors.white} />
          {fontsLoaded && <HomeScreen />}
          {(showSplash || !fontsLoaded) && (
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
