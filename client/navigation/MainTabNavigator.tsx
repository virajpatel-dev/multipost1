import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import PostsStackNavigator from "@/navigation/PostsStackNavigator";
import AccountStackNavigator from "@/navigation/AccountStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing } from "@/constants/theme";

export type MainTabParamList = {
  PostsTab: undefined;
  ComposeTab: undefined;
  AccountTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ComposeTabButton() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Compose");
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fabButton, { backgroundColor: theme.primary }, animatedStyle]}
    >
      <Feather name="plus" size={28} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

function EmptyScreen() {
  return <View />;
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="PostsTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
          paddingBottom: 25,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="PostsTab"
        component={PostsStackNavigator}
        options={{
          title: "Posts",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ComposeTab"
        component={EmptyScreen}
        options={{
          title: "",
          tabBarButton: () => <ComposeTabButton />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountStackNavigator}
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
