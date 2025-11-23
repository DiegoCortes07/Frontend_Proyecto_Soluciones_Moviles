import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NowPlayingScreen from "../../features/music/screens/NowPlayingScreen";
import LoginScreen from "../../features/account/screens/loginScreen";
import RegisterScreen from "../../features/account/screens/registerScreen";
import RegisterEmailScreen from "../../features/account/screens/registerEmailScreen";


export type RootStackParamList = { Login: undefined, Register: undefined, RegisterEmail: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, headerBackVisible: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
    </Stack.Navigator>
  );
}
