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
          backgroundColor: TAB_BAR_BG,
          borderTopColor: "#3282B830",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
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
