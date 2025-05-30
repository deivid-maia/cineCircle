import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendsScreen from '../screens/FriendsScreen';
import FriendProfileScreen from '../screens/FriendProfileScreen';
import FriendMoviesListScreen from '../screens/FriendMoviesListScreen';

const Stack = createNativeStackNavigator();

const FriendsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#18181B' },
      }}
    >
      <Stack.Screen name="FriendsMain" component={FriendsScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
      <Stack.Screen name="FriendMoviesList" component={FriendMoviesListScreen} />
    </Stack.Navigator>
  );
};

export default FriendsStackNavigator;