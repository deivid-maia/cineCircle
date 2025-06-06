import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FriendsStackNavigator from './FriendsStackNavigator';

// Suas telas dentro do menu principal - app principal
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import AddContentScreen from '../screens/AddContentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreScreen from '../screens/ExploreScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  // TabNavigator.js - Abas principais ✅  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#27272A',
          borderTopColor: '#343438',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#BD0DC0',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen} // 🔥 VOLTA AO HOMESCREEN NORMAL
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />

      {/* 🔥 NOVA TELA DE CATEGORIA (oculta da tab bar) */}
      <Tab.Screen
        name="Categoria"
        component={CategoryScreen}
        options={{
          tabBarButton: () => null, // Oculta da tab bar
          tabBarStyle: { display: 'none' }, // Oculta a tab bar quando esta tela estiver ativa
        }}
      />

      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="AddContent"
        component={AddContentScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <Feather name="plus" color="white" size={24} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="FriendsTab"
        component={FriendsStackNavigator}
        options={{
          tabBarLabel: 'Amigos',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#BD0DC0',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
});

export default TabNavigator;