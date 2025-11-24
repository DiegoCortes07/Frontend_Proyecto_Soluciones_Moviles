import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { register } from "../../../../../api/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCopy, setPasswordCopy] = useState("");
  const [username, setUsername] = useState("");

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPass, setInvalidPass] = useState(false);
  const [invalidCopyPass, setInvalidCopyPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error

  const completeDat = useRef(true);

  const navigation = useNavigation();

  const handleRegister = () => {
    console.log("Usuario:", username); // Debe ser 'Diafx'
    console.log("Email:", email); // Debe ser 'diego@test.com'
    console.log("Password:", password); // Debe ser 'Password123$'

    // Intentar registrar el usuario
    register(username, email, password)
      .then((response) => {
        console.log("Registro exitoso:", response.data);
        // Navegar a la pantalla de inicio de sesión
        navigation.navigate("Login" as never);
      })
      .catch((error) => {
        console.error("Error en el registro:", error.response?.data || error.message);
        
        // Determinar el mensaje de error con mayor detalle
        let detailedMessage = "Hubo un error en el registro, por favor intenta de nuevo.";

        if (error.response?.data?.message) {
          const errorMessage = error.response?.data?.message;

          // Personalizar mensaje basado en el error
          if (errorMessage.includes("faltan campos obligatorios")) {
            detailedMessage = "Por favor, asegúrate de completar todos los campos (nombre, correo y contraseña).";
          } else if (errorMessage.includes("El correo electrónico ya está en uso")) {
            detailedMessage = "Este correo electrónico ya está registrado. Intenta con otro.";
          } else if (errorMessage.includes("Formato de email inválido")) {
            detailedMessage = "El correo electrónico ingresado no tiene un formato válido.";
          }
        }

        // Actualizamos el estado para mostrar el mensaje de error
        setErrorMessage(detailedMessage);
      });
  };

  // Validación EMAIL
  useEffect(() => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
      completeDat.current = false;
      if (email) setInvalidEmail(true);
      return;
    }

    setInvalidEmail(false);
  }, [email]);

  // Validación PASSWORD
  useEffect(() => {
    const regexPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

    if (!regexPass.test(password)) {
      completeDat.current = false;
      if (password) setInvalidPass(true);
      return;
    }
    setInvalidPass(false);

    // Confirmación
    if (password !== passwordCopy) {
      completeDat.current = false;
      setInvalidCopyPass(true);
      return;
    }
    setInvalidCopyPass(false);
  }, [password, passwordCopy]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <View style={styles.gradientTop} />

      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
          }}
          style={styles.logo}
        />

        <Text style={styles.title}>Crear cuenta con Email</Text>

        {/* Nombre */}
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {invalidEmail && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>• Formato de email inválido.</Text>
          </View>
        )}

        {/* Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {invalidPass && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>• 8 a 15 caracteres</Text>
            <Text style={styles.errorText}>• 1 Mayúscula</Text>
            <Text style={styles.errorText}>• 1 minúscula</Text>
            <Text style={styles.errorText}>• 1 número</Text>
            <Text style={styles.errorText}>• 1 símbolo especial</Text>
          </View>
        )}

        {/* Confirmación */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          value={passwordCopy}
          onChangeText={setPasswordCopy}
        />

        {invalidCopyPass && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>• Las contraseñas no coinciden</Text>
          </View>
        )}

        {/* Mostrar mensaje de error si existe */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Botón Registrar */}
        <TouchableOpacity onPress={handleRegister}>
          <View style={styles.registerButton}>
            <Text style={styles.registerText}>Crear cuenta</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.divider}>────────── o ──────────</Text>

        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginLink}>
            ¿Ya tienes una cuenta?{" "}
            <Text style={{ color: "#1DB954", fontWeight: "600" }}>
              Inicia sesión
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gradientTop: {
    position: "absolute",
    top: -120,
    height: 260,
    width: "100%",
    backgroundColor: "#1DB95433",
    borderBottomLeftRadius: 250,
    borderBottomRightRadius: 250,
    zIndex: -1,
  },

  container: {
    flex: 1,
    alignItems: "center",
    padding: 25,
    paddingTop: 90,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 15,
    opacity: 0.9,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 10,
    color: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },

  errorBox: {
    width: "100%",
    backgroundColor: "#ff000022",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },

  errorText: {
    color: "#ff8a8a",
    fontSize: 14,
  },

  registerButton: {
    width: "100%",
    padding: 15,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#1DB954", // Color fijo para el botón
  },

  registerText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },

  divider: {
    color: "#555",
    marginVertical: 30,
  },

  loginLink: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
});
