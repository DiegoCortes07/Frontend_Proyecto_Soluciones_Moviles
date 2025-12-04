import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../features/account/screens/Auth/loginScreen";
import RegisterScreen from "../../features/account/screens/Auth/registerScreen";
import RegisterEmailScreen from "../../features/account/screens/Auth/registerEmailScreen";
import HomeScreen from "../../features/home/screens/home";
import LibraryScreen from "../../features/home/screens/Library";
import AlbumScreen from "../../features/Album/screens/album";
import { AuthProvider } from "../../contexts/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  RegisterEmail: undefined;
  Home: undefined;
  Player: undefined;
  Library: undefined;
  Album: { id: number };
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <AuthProvider>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, headerBackVisible: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Album" component={AlbumScreen} />
      </Stack.Navigator>
    </AuthProvider>
  );
}
