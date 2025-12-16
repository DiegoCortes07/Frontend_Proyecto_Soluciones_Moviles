import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../features/account/screens/Auth/loginScreen";
import RegisterScreen from "../../features/account/screens/Auth/registerScreen";
import RegisterEmailScreen from "../../features/account/screens/Auth/registerEmailScreen";
import HomeScreen from "../../features/home/screens/home";
import VerifyMail from "../../features/account/screens/verifyMailScreen";
import ProfileScreen from "../../features/home/screens/profileSettingsScreen";
import StartLoadScreen from "../../features/home/screens/startLoadScreen";
import LibraryScreen from "../../features/home/screens/Library";
import AlbumScreen from "../../features/Album/screens/album";
import ProfileScreen from "../../features/account/screens/ProfileScreen";
import SettingsScreen from "../../features/account/screens/SettingsScreen";
import PlanScreen from "../../features/account/screens/PlanScreen";
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
  StartLoad: undefined;
  VerifyMail: undefined;
  ProfileSettings: undefined;
  Album: { id: number };
  Profile: undefined;
  Settings: undefined;
  Plan: undefined;
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
            <Stack.Screen name="StartLoad" component={StartLoadScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="Album" component={AlbumScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Plan" component={PlanScreen} />
            <Stack.Screen name="VerifyMail" component={VerifyMail} />
            <Stack.Screen name="ProfileSettings" component={ProfileScreen}/>
          </Stack.Navigator>
        </PlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
