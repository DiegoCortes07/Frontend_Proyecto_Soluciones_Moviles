import React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Platform } from "react-native";
import RootNavigator from "./src/app/navigation/RootNavigator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

//Permite que paginas se puedan acceder desde url
const linking = {
  prefixes: ["miapp://", "http://localhost:8081/"],
  config: {
    screens: {
      VerifyMail: {
        path: "verify-mail",
        parse: {token: (value: any) => value}
      }
    },
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent={Platform.OS === "android"}
        />
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}