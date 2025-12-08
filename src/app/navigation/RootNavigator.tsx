import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../features/account/screens/Auth/loginScreen";
import RegisterScreen from "../../features/account/screens/Auth/registerScreen";
import RegisterEmailScreen from "../../features/account/screens/Auth/registerEmailScreen";
import HomeScreen from "../../features/home/screens/home";
import Player from "../../features/PlayerSong/player";
import VerifyMail from "../../features/account/screens/verifyMailScreen";
import ProfileScreen from "../../features/home/screens/profileSettingsScreen";
import StartLoadScreen from "../../features/home/screens/startLoadScreen";


export type RootStackParamList = { 
  Login: undefined, 
  Register: undefined, 
  RegisterEmail: undefined, 
  Home: undefined, 
  ProfileSettings: undefined,
  Player: undefined,
  VerifyMail: undefined,
  StartLoad: undefined
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="StartLoad"
      screenOptions={{ headerShown: false, headerBackVisible: false }}
    >
      <Stack.Screen name="StartLoad" component={StartLoadScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileScreen}/>
      <Stack.Screen name="Player" component={Player} />
      <Stack.Screen name="VerifyMail" component={VerifyMail} />
    </Stack.Navigator>
  );
}
