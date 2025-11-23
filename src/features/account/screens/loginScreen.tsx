import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Image, 
  Animated,
  TouchableWithoutFeedback
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePass, setVisiblePass] = useState(false);

  const [errorData, setErrorData] = useState(false);
  const completeDat = useRef(true);
  
  const navigatior = useNavigation();
  

  const handleLogin = () => {


    if(!completeDat.current) return;
    
    console.log("Email:", email);
    console.log("Password:", password);

    //ta ta envio datos

    setErrorData(true);
  };

  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log("AA");
    if( !email|| !password ){
      handlePress(false);
      completeDat.current = false;
      return;
    }

    if(!regex.test(email)){
      handlePress(false);
      completeDat.current = false;
      return;
    }
    handlePress(true);
    completeDat.current = true;
  }, [email, password])


  const animation = useRef(new Animated.Value(0)).current;

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

  const loginBgColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1DB954", "#53645954"], // color normal → color animado
  });

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image 
        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png?20220125121207" }}
        style={styles.logo}
      />

      {/* Título */}
      <Text style={styles.title}>Inicia sesión</Text>

      {/* Input Email */}
      <TextInput
        placeholder="Correo o nombre de usuario"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.container_right}>
        {/* Input Password */}
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry={visiblePass}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setVisiblePass(!visiblePass)}
        >
          <Image 
          source={{ uri: visiblePass ? "https://icons.veryicon.com/png/o/miscellaneous/simple-linetype-icon/eye-43.png" : 
            "https://icons.veryicon.com/png/o/miscellaneous/computer-room-integration/hide-password.png"
          }}
          style={{ width: "100%", height: "100%", tintColor: "grey"}}
          />
        </TouchableOpacity>
      </View>

      {/* Botón Ingresar */}
      <TouchableWithoutFeedback onPress={handleLogin}>
        <Animated.View style={[styles.loginButton, { backgroundColor: loginBgColor}]}>
          <Text style={styles.loginText}>Iniciar sesión</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
      
      {errorData && (
        <Text style={styles.errorText}>Datos Incorrectos.</Text>
      )}

      {/* División */}
      <Text style={styles.divider}>────────  o  ────────</Text>

      {/* Crear cuenta */}
      <TouchableOpacity onPress={()=>navigatior.navigate("Register")}>
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  container_right: {
    flexDirection: "column",
    width: "100%",
    backgroundColor: "#121212",
    alignItems: "flex-end",

  },
  logo: {
    width: 140,
    height: 42,
    marginBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
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
  eyeButton: {
    transform: [{ translateY: -60 }, {translateX:-20}],
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  errorText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 20
  },
  loginButton: {
    width: "100%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    color: "#555",
    marginVertical: 20,
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
  registerText: {
    marginTop: 25,
    color: "#1DB954",
    fontSize: 15,
  },
});
