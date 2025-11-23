import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCopy, setPasswordCopy] = useState("");
  
  const [user, setUser] = useState("");
  
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPass, setInvalidPass] = useState(false);
  const [invalidCopyPass, setInvalidCopyPass] = useState(false);


  const completeDat = useRef(true);

  const navigation = useNavigation();
  const animation = useRef(new Animated.Value(0)).current;

  const handleRegister = () => {
    console.log("Usuario:", user);
    console.log("Email:", email);
    console.log("Password:", password);

    if ( !completeDat.current) return;
    // Aquí iría la lógica real del registro
  };

  const handlePress = (active:boolean) => {
    if(active == completeDat.current){
      return;
    }
    Animated.sequence([
      Animated.timing(animation, {
        toValue: active ? 1:0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animation, {
        toValue: active ? 0:1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const registerBgColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1DB954", "#53645954"], // color normal → color animado
  });

  useEffect(() => {
    const regexEmail = /^(?=.*[@])[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!regexEmail.test(email)){
      handlePress(false);
      completeDat.current = false;
      if(!email) return;
      setInvalidEmail(true);
      return;
    }
    
    setInvalidEmail(false);
    
    if(!invalidPass && !!password){
      handlePress(true);
      completeDat.current = true;
    }
  }, [email])
  useEffect(() => {
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;    
 

    if(!regexPass.test(password)){
      handlePress(false);
      completeDat.current = false;
      if(!password) return;
      setInvalidPass(true);
      return;
    }
    setInvalidPass(false);

    if(password != passwordCopy){
      handlePress(false);
      completeDat.current = false;
      setInvalidCopyPass(true);
      return;
    }
    setInvalidCopyPass(false);

    if(!invalidEmail && !!email){
      handlePress(true);
      completeDat.current = true;
    }
  }, [password,passwordCopy])

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

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {invalidEmail && (
          <View style={styles.container_left}>
            <Text style={styles.errorText}>El email debe tener el formato correcto.</Text>
          </View>
        )}

        {/* Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {invalidPass && (
          <View style={styles.container_left}>
            <Text style={styles.errorText}>La contraseña debe tener entre 8 y 15 caracteres.</Text>
              <Text style={styles.errorText}>Al menos una letra mayúscula</Text>
              <Text style={styles.errorText}>Al menos una letra minúscula</Text>
              <Text style={styles.errorText}>Al menos un número</Text>
              <Text style={styles.errorText}>Al menos un símbolo</Text>
          </View>
        )}
        {/* Confirmar Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={passwordCopy}
          onChangeText={setPasswordCopy}
        />
        {invalidCopyPass && (
          <View style={styles.container_left}>
            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
          </View>
        )}
        {/* Botón Registrar */}
        <TouchableWithoutFeedback onPress={handleRegister}>
          <Animated.View style={[styles.registerButton, {backgroundColor:registerBgColor}]}>
            <Text style={styles.registerText}>Registrarse</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <Text style={styles.divider}>──────────  o  ──────────</Text>

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
  container_left: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    right: -10,
    marginBottom: 15,
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
  errorText: {
    color: "white",
    fontSize: 16,
  },
});
