import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");

   const navigation = useNavigation();

  const handleRegister = () => {
    console.log("Usuario:", user);
    console.log("Email:", email);
    console.log("Password:", password);
    // Aquí iría la lógica real del registro
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={styles.container}>

        {/* Logo */}
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png?20220125121207",
          }}
          style={styles.logo}
        />

        <Text style={styles.title}>Crear cuenta</Text>

        {/* Botones sociales opcionales */}
        <TouchableOpacity style={styles.socialButton} onPress={() => navigation.navigate("RegisterEmail")}>
          <Text style={styles.socialText}>Continuar con Email</Text>
        </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialText}>Continuar con Telefono</Text>
        </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialText}>Continuar con Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialText}>Continuar con Apple</Text>
        </TouchableOpacity>

        {/* Si ya tiene cuenta */}
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 25,
  },
  logo: {
    width: 140,
    height: 42,
    resizeMode: "contain",
    marginTop: 50,
    marginBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 8,
    color: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  registerText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    color: "#555",
    marginVertical: 25,
  },
  socialButton: {
    width: "100%",
    backgroundColor: "#2A2A2A",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  socialText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  loginLink: {
    color: "#1DB954",
    fontSize: 15,
  },
});
