import React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    <QueryClientProvider client={queryClient}>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}