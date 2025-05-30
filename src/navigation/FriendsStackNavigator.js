import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendSearchScreen from '../screens/FriendSearchScreen';
import FriendsFeedScreen from '../screens/FriendsFeedScreen';
import FriendProfileScreen from '../screens/FriendProfileScreen'; // Você pode criar depois
import FriendsScreen from '../screens/FriendsScreen';

const Stack = createNativeStackNavigator();

const FriendsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#18181B' },
      }}
    >
      <Stack.Screen name="FriendSearch" component={FriendsScreen} />
      <Stack.Screen name="FriendsFeed" component={FriendsFeedScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
};

export default FriendsStackNavigator;