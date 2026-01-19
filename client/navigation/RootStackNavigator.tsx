import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import ComposeScreen from "@/screens/ComposeScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Compose: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Compose"
            component={ComposeScreen}
            options={({ navigation }) => ({
              presentation: "modal",
              headerTitle: "Create Post",
              headerLeft: () => (
                <HeaderButton onPress={() => navigation.goBack()}>
                  <Feather name="x" size={24} color={theme.text} />
                </HeaderButton>
              ),
            })}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
