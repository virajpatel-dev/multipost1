import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostsScreen from "@/screens/PostsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PostsStackParamList = {
  Posts: undefined;
};

const Stack = createNativeStackNavigator<PostsStackParamList>();

export default function PostsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="MultiPost" />,
        }}
      />
    </Stack.Navigator>
  );
}
