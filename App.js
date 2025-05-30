import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';

// Contextos
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MoviesProvider } from './src/contexts/useMovies';
import { FriendsProvider } from './src/contexts/FriendsContext'; // 👥 NOVO CONTEXTO

// Telas de autenticação
import InitialScreen from './src/screens/InitialScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SucessScreen from './src/screens/SucessScreen';

// Navegador com Drawer (o TabNavigator está dentro dele)
import DrawerNavigator from './src/navigation/DrawerNavigator';

// Telas independentes do drawer/tab
import MovieDetailScreen from './src/screens/MovieDetailScreen';


const Stack = createNativeStackNavigator();

// Tema personalizado para o NavigationContainer
const MyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#BD0DC0',
    background: '#18181B',
    card: '#27272A',
    text: '#FFFFFF',
    border: '#27272A',
    notification: '#BD0DC0',
  },
};

// Componente de loading
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#BD0DC0" />
    <Text style={styles.loadingText}>Inicializando...</Text>
  </View>
);

// Navegação principal
const AppNavigator = () => {
  const { user, initializing } = useAuth();

  console.log('AppNavigator - User:', user ? 'Authenticated' : 'Not authenticated');
  console.log('AppNavigator - Initializing:', initializing);

  // Mostrar loading enquanto verifica o estado de autenticação
  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#18181B' },
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // Usuário autenticado - mostrar telas principais
          <>
            <Stack.Screen
              name="MainApp"
              component={DrawerNavigator}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Detalhes" component={MovieDetailScreen} />
          </>
        ) : (
          // Usuário não autenticado - mostrar telas de auth
          <>
            <Stack.Screen
              name="Inicial"
              component={InitialScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={RegisterScreen} />
            <Stack.Screen name="RedefinirSenha" component={ForgotPasswordScreen} />
            <Stack.Screen name="Sucesso" component={SucessScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  // Configurar a cor da barra de navegação do Android
  useEffect(() => {
    const setupNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setBackgroundColorAsync('#18181B');
          await NavigationBar.setButtonStyleAsync('light');
        } catch (error) {
          console.error('Erro ao configurar barra de navegação:', error);
        }
      }
    };

    setupNavigationBar();
  }, []);

  return (
    <AuthProvider>
      <MoviesProvider>
        <FriendsProvider> {/* 👥 NOVO PROVIDER */}
          <SafeAreaProvider>
            <View style={styles.container}>
              <StatusBar style="light" backgroundColor="#18181B" />
              <AppNavigator />
            </View>
          </SafeAreaProvider>
        </FriendsProvider>
      </MoviesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18181B',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
});