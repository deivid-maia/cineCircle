import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Platform } from 'react-native';
import CustomDrawerContent from '../components/CustomDrawerContent';
import UserMoviesScreen from '../screens/UserMoviesScreen';

// Ele é nosso contêiner principal, ele esta fazendo a ponte entre o auth e o app principal HomeTab
import TabNavigator from './TabNavigator';

// Telas para o drawer estao dentro da home no menu lateral
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpScreen from '../screens/HelpScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

import RecommendationsReceivedScreen from '../screens/RecommendationsReceivedScreen';

// TODAS AS IMPORTAÇÕES PROBLEMÁTICAS FORAM REMOVIDAS

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#18181B',
          width: 280,
        },
        drawerType: Platform.OS === 'ios' ? 'slide' : 'front',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        swipeEdgeWidth: 100, // Área para arrastar e abrir o drawer
        drawerStatusBarAnimation: 'slide',
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />

      <Drawer.Screen 
        name="RecommendationsReceived" 
        component={RecommendationsReceivedScreen}
        options={{ title: 'Recomendações Recebidas' }}
      />
      
      {/* 
      TELAS TEMPORARIAMENTE DESABILITADAS ATÉ RESOLVERMOS OS CONTEXTOS:
      
      <Drawer.Screen 
        name="MyRecommendations" 
        component={MyRecommendationsScreen}
        options={{ title: 'Minhas Recomendações' }}
      />
      <Drawer.Screen 
        name="MyReviews" 
        component={MyReviewsScreen}
        options={{ title: 'Minhas Resenhas' }}
      />
      <Drawer.Screen 
        name="MyRatings" 
        component={MyRatingsScreen}
        options={{ title: 'Minhas Avaliações' }}
      />
      <Drawer.Screen 
        name="FriendsRanking" 
        component={FriendsRankingScreen}
        options={{ title: 'Ranking de Amigos' }}
      />
      */}
      
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="UserMovies" component={UserMoviesScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;