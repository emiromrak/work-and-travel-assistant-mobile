import "./src/global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1B262C" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
