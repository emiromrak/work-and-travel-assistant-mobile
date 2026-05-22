import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Ana ekranlar (Tablar) */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      {/* Tabların üzerine açılacak Profil Ekranı */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          animation: 'slide_from_right' 
        }} 
      />
      {/* Sohbet Detay Ekranı */}
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen} 
        options={{ 
          animation: 'slide_from_right' 
        }} 
      />
    </Stack.Navigator>
  );
}
