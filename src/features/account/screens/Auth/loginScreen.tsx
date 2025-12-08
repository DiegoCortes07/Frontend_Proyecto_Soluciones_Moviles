import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Image, 
  Animated,
  BackHandler
} from "react-native";

import { RootStackParamList } from "../../../../app/navigation/RootNavigator";
import {login} from "../../../../../api/auth";
import { useSaveData } from "../../../home/hooks/appStorage";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePass, setVisiblePass] = useState(false);

  const [errorData, setErrorData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Credenciales inválidas")
  const [seconds, setSeconds] = useState(0);
  const [blockedLogin, setBlockedLogin] = useState(false);

  const canSubmit = useRef(false);
  const loginAttempts = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animación botón
  const animation = useRef(new Animated.Value(0)).current;

  // Animación shake del error
  const shake = useRef(new Animated.Value(0)).current;

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const animateButton = (active: boolean) => {
    Animated.timing(animation, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if(blockedLogin) return;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const active =
      email.length > 0 &&
      password.length > 0 &&
      regex.test(email);

    canSubmit.current = active;
    animateButton(active);
  }, [email, password]);

  const loginBgColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#2a2a2a", "#1DB954"],
  });

  const loginGlow = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0px", "8px"],
  });

  useFocusEffect(
    // El useCallback asegura que el listener solo se cree cuando el componente
    // se enfoca (es visible).
    useCallback(() => {
      // Define la función que se ejecutará al presionar el botón de retroceso.
      const onBackPress = () => {
        BackHandler.exitApp();
        return true; 
      };

      // Adjunta el listener cuando la pantalla está enfocada.
      const event = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Limpia el listener cuando la pantalla pierde el foco
      return () => event.remove();
    }, [])
  );

  const handleLogin = () => {
    if(blockedLogin) return;

    console.log("Email:", email);
    console.log("Password:", password);
 
    
    login(email, password)
      .then((data) => {
        setErrorData(false);
        //Guarda el token de manera local
        useSaveData("Session",data.user.token)
        .catch((err)=>{
          console.error(err);
        })
        // lo enviamos al home con el token
        navigation.navigate("Home");
        console.log("Login exitoso");
      })
      .catch((error) => {
        if(error.message == "Cuenta inhabilitada"){
          setErrorMessage("Esta cuenta aun no esta activada, revise su email.");
        }
        else{
          setErrorMessage("Credenciales inválidas");
        }
        loginAttempts.current++;
        setErrorData(true);
        shakeAnimation();
      });
    
    if((loginAttempts.current + 1)%5 == 0){
      setBlockedLogin(true);
      animateButton(false);
      setSeconds(25);

      timer.current = setInterval(() => {
        setSeconds(prev => prev - 1);
        setBlockedLogin(true);
      }, 1000);
    }

  };

  useEffect(()=>{
    
    if(seconds<= 0 && !!timer.current){
      clearInterval(timer.current); 
      timer.current = null;
      setBlockedLogin(false);
    }
  }, [seconds]);

  return (
    <View style={styles.backgroundContainer}>
      {/* GRADIENTE ANIMADO */}
      <Animated.View style={[styles.gradient1]} />
      <Animated.View style={[styles.gradient2]} />

      <View style={styles.container}>

        {/* Logo */}
        <Image 
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png" }}
          style={styles.logo}
        />

        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {/* INPUT EMAIL */}
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#cccccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {/* INPUT PASSWORD */}
        <View style={{ width: "100%" }}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#cccccc"
            secureTextEntry={!visiblePass}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setVisiblePass(!visiblePass)}
          >
            <Image 
              source={{
                uri: visiblePass
                  ? "https://cdn-icons-png.flaticon.com/512/159/159604.png"
                  : "https://cdn-icons-png.flaticon.com/512/159/159605.png"
              }}
              style={{ width: 26, height: 26, tintColor: "#aaa" }}
            />
          </TouchableOpacity>
        </View>

        {/* BOTÓN LOGIN */}
        <Animated.View
          style={{ transform: [{ translateX: shake }] }}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
            <Animated.View 
              style={[
                styles.loginButton, 
                { backgroundColor: loginBgColor, shadowRadius: loginGlow }
              ]}
            >
              <Text style={styles.loginText}>Iniciar sesión</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {errorData && 
          <Text style={styles.errorText}>{errorMessage}</Text>
        }

        {blockedLogin &&
          <>
          <Text style={styles.subtitle}>Demasiados intentos fallidos.</Text>
          <Text style={styles.subtitle}>Espere la siguiente cantidad de tiempo.</Text>
          <Text style={styles.title}>{seconds}</Text>
          <Text style={styles.title}>Segundos.</Text>
          </>

        }

        <Text style={styles.divider}>────────  o  ────────</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>Crear una cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    justifyContent: "center",
    alignItems: "center",
  },

  gradient1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "rgba(29,185,84,0.25)",
    top: -40,
    left: -80,
    filter: "blur(60px)",
  },

  gradient2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "rgba(0,150,255,0.20)",
    bottom: -40,
    right: -80,
    filter: "blur(60px)",
  },

  container: {
    width: "90%",
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 30,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#bbbbbb",
    fontSize: 15,
    marginBottom: 25,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 15,
    borderRadius: 12,
    color: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  eyeButton: {
    position: "absolute",
    right: 15,
    top: 18,
  },

  loginButton: {
    width: 260,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },

  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },

  errorText: {
    color: "#ff6b6b",
    marginTop: 15,
    fontSize: 16,
  },

  divider: {
    color: "#777",
    marginVertical: 22,
  },

  registerText: {
    color: "#1DB954",
    fontSize: 16,
  },
});