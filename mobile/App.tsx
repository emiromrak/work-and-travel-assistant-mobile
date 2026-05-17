import "./src/global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import { UserProvider, useUser } from "./src/context/UserContext";

// İç bileşen (Context'i kullanabilmek için Provider'ın içinde olmalı)
function RootNavigator() {
  const { user } = useUser();

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1B262C" />
      {user ? <AppNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <RootNavigator />
    </UserProvider>
  );
}
