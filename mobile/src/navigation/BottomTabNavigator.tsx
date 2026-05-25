import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import DashboardScreen from "../screens/DashboardScreen";
import BudgetScreen from "../screens/BudgetScreen";
import MapScreen from "../screens/MapScreen";
import GuideScreen from "../screens/GuideScreen";
import SocialScreen from "../screens/SocialScreen";
import ChatListScreen from "../screens/ChatListScreen";

const Tab = createBottomTabNavigator();

const TAB_BAR_BG = "#0F4C75";
const ACTIVE_COLOR = "#3282B8";
const INACTIVE_COLOR = "#BBE1FA80";

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0B3A5C",
          borderTopColor: "#3282B840",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 26 : 12,
          paddingTop: 10,
          elevation: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: "#BBE1FA",
        tabBarInactiveTintColor: "#BBE1FA50",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Social") {
            iconName = focused ? "share-social" : "share-social-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          } else if (route.name === "Budget") {
            iconName = focused ? "calculator" : "calculator-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Guide") {
            iconName = focused ? "compass" : "compass-outline";
          }

          return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Ana Sayfa" }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ tabBarLabel: "Sosyal" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarLabel: "Sohbet" }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarLabel: "Bütçe" }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: "Harita" }}
      />
      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{ tabBarLabel: "Rehber" }}
      />
    </Tab.Navigator>
  );
}
