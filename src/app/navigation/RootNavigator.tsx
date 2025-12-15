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
import { AuthProvider } from "../../contexts/AuthContext";
import { PlayerProvider } from "../../contexts/PlayerContext";
import ChangePassScreen from "../../features/account/screens/Auth/changePassScreen";

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
  ChangePassword: undefined;
  Album: { id: number };
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Stack.Navigator
          initialRouteName="StartLoad"
          screenOptions={{ headerShown: false, headerBackVisible: false }}
        >
          <Stack.Screen name="StartLoad" component={StartLoadScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="Album" component={AlbumScreen} />
          <Stack.Screen name="VerifyMail" component={VerifyMail} />
          <Stack.Screen name="ProfileSettings" component={ProfileScreen}/>
          <Stack.Screen name="ChangePassword" component={ChangePassScreen}/>
        </Stack.Navigator>
      </PlayerProvider>
    </AuthProvider>
  );
}
