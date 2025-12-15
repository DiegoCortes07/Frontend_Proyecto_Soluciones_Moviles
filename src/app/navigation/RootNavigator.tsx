import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../features/account/screens/Auth/loginScreen";
import RegisterScreen from "../../features/account/screens/Auth/registerScreen";
import RegisterEmailScreen from "../../features/account/screens/Auth/registerEmailScreen";
import HomeScreen from "../../features/home/screens/home";
import LibraryScreen from "../../features/home/screens/Library";
import AlbumScreen from "../../features/Album/screens/album";
import ProfileScreen from "../../features/account/screens/ProfileScreen";
import SettingsScreen from "../../features/account/screens/SettingsScreen";
import { AuthProvider } from "../../contexts/AuthContext";
import { PlayerProvider } from "../../contexts/PlayerContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  RegisterEmail: undefined;
  Home: undefined;
  Player: undefined;
  Library: undefined;
  Album: { id: number };
  Profile: undefined;
  Settings: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlayerProvider>
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
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </PlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
