import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../../contexts/AuthContext";
import { updatePass } from "../../../../../api/auth";
import Icon from "react-native-vector-icons/FontAwesome";

declare const window: any;

export default function ChangePassScreen() {
    const navigation = useNavigation();
    const { token } = useAuth();

    const [password,setPassword] = useState("");
    const [newPass,setNewPass] = useState("");
    const [confirmNewPass,setConfirmNewPass] = useState("");

    const [invalidPass, setInvalidPass] = useState(false);
    const [errorNewPassMessage, setErrorNewPassMessage] = useState("");
    const [invalidCopyPass, setInvalidCopyPass] = useState(false);
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error

    const [seconds, setSeconds] = useState(0);
    const [blockedChange, setBlockedChange] = useState(false);

    const passAttempts = useRef(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const formComplete = useRef(true);

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

    // Animacion para la transicion de color
    const animateButton = (active: boolean) => {
        Animated.timing(animation, {
            toValue: active ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const loginBgColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["#2a2a2a", "#1DB954"],
    });

    const loginGlow = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 8],
    });

    // Para hacer las verificaciones de la contraseña nueva
    useEffect(() => {
        if(blockedChange) return;
        const regexPass =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          
        if(newPass == password && newPass){
            formComplete.current = false;
            setInvalidPass(true);
            setErrorNewPassMessage("La nueva contraseña no puede ser la misma que la anterior");
            return
        }
        if (!regexPass.test(newPass)) {
          formComplete.current = false;
          if (newPass){
            setInvalidPass(true);
            setErrorNewPassMessage("La nueva contraseña no coincide con los requisitos");
          }else{
            setInvalidPass(false);
          }
          return;
        }
        setInvalidPass(false);

        // Confirmación
        if (newPass !== confirmNewPass) {
          formComplete.current = false;
          setInvalidCopyPass(true);
          return;
        }
        setInvalidCopyPass(false);
        formComplete.current = true;
        animateButton(formComplete.current);
    }, [password,newPass, confirmNewPass]);

    // Para terminar el conteo
    useEffect(()=>{
        if(seconds<= 0 && !!timer.current){
            clearInterval(timer.current); 
            timer.current = null;
            setBlockedChange(false);
        }
    }, [seconds]);

    const saveChanges= ()=> {
        if(blockedChange) return;

        updatePass(token,password,newPass)
        .then(()=>{
            if (Platform.OS === "web") {
                window.alert("Tu contraseña fue actualizada");
            } else {
                Alert.alert("Tu contraseña fue actualizada");
            }
            navigation.navigate("Home" as never);
        })
        .catch((err)=>{
            console.error("Error en el registro:", err.response?.data || err.message);
            // Determinar el mensaje de error con mayor detalle
            let detailedMessage = "Hubo un error en el registro, por favor intenta de nuevo.";

            if (err.response?.data) {
                // Personalizar mensaje basado en el error
                if (err.response?.data.includes("Contraseña inválida")) {
                    detailedMessage = "La contraseña actual es incorrecta.";
                } 
            }

            // Actualizamos el estado para mostrar el mensaje de error
            setErrorMessage(detailedMessage);
            passAttempts.current++;
            shakeAnimation();

            // Cada 5 intentos se realiza la espera
            if((passAttempts.current + 1)%5 == 0){
                setBlockedChange(true);
                animateButton(false);
                setSeconds(25);
    
                timer.current = setInterval(() => {
                    setSeconds(prev => prev - 1);
                    setBlockedChange(true);
                }, 1000);
            }
        })
    }

return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backgroundContainer}
    >
        <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >
        {/* GRADIENTE ANIMADO */}
        <Animated.View style={[styles.gradient1]} />
        <Animated.View style={[styles.gradient2]} />

        <View style={styles.container}>
            <View style={styles.rowCointain}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home" as never)}
                    style={styles.backButton}
                    accessibilityLabel="volver"
                    >
                    <Icon name="chevron-left" size={18} color="#071428" />
                </TouchableOpacity>
            </View>
            {/* Logo */}
            <Image 
                source={{ uri: "https://repositorio.iica.int/assets/images/IICA/Spotify.png" }}
                style={styles.logo}
            />

            <Text style={styles.title}>Cambiar contraseña</Text>
            <Text style={styles.subtitle}>Primero ingrese su contraseña actual</Text>
            <Text style={styles.subtitle}>La contraseña debe tener:</Text>
            <View style={styles.reqBox}>
                <Text style={styles.reqText}>• Al menos 8 caracteres</Text>
                <Text style={styles.reqText}>• 1 Mayúscula</Text>
                <Text style={styles.reqText}>• 1 minúscula</Text>
                <Text style={styles.reqText}>• 1 número</Text>
                <Text style={styles.reqText}>• 1 símbolo especial</Text>
            </View>

            {/* INPUT PASS */}
            <TextInput
                placeholder="Contraseña actual"
                placeholderTextColor="#cccccc"
                secureTextEntry={true}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            {/* INPUT NEW PASS */}
            <TextInput
                placeholder="Nueva contraseña"
                placeholderTextColor="#cccccc"
                secureTextEntry={true}
                style={styles.input}
                value={newPass}
                onChangeText={setNewPass}
            />
            {invalidPass && (
                <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorNewPassMessage}</Text>
                </View>
            )}
            {/* INPUT CONFIRM PASS */}
            <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#cccccc"
                secureTextEntry={true}
                style={styles.input}
                value={confirmNewPass}
                onChangeText={setConfirmNewPass}
            />
            {(invalidCopyPass && !invalidPass) &&  (
                <View style={styles.errorBox}>
                <Text style={styles.errorText}>• Las contraseñas no coinciden</Text>
                </View>
            )}

            {/* BOTÓN SAVE */}
            <Animated.View
                style={{ transform: [{ translateX: shake }] }}
            >
                <TouchableOpacity activeOpacity={0.8} onPress={saveChanges}>
                <Animated.View 
                    style={[
                    styles.changeButton, 
                    { backgroundColor: loginBgColor, shadowRadius: loginGlow }
                    ]}
                >
                    <Text style={styles.changeText}>Guardar contraseña</Text>
                </Animated.View>
                </TouchableOpacity>
            </Animated.View>
            {/* Mostrar mensaje de error si existe */}
            {errorMessage !== "" && (
                <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}
            {blockedChange && 
                <>
                <Text style={styles.subtitle}>Demasiados intentos fallidos.</Text>
                <Text style={styles.subtitle}>Espere la siguiente cantidad de tiempo.</Text>
                <Text style={styles.title}>{seconds}</Text>
                <Text style={styles.title}>Segundos.</Text>
                </>

            }
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  rowCointain:{
    flex:1,
    flexDirection: "row",
    width: "100%"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },

  gradient1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(25, 174, 204, 0.25)",
    top: -40,
    left: 200,
  },

  gradient2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(0,150,255,0.20)",
    bottom: -40,
    right: 180,
  },

  container: {
    width: "90%",
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    tintColor: 'rgba(52, 57, 134, 1)'
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

  changeButton: {
    width: 260,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#1DB954",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 10
  },

  changeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  reqBox: {
    width: "100%",
    backgroundColor: "#6960db22",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  reqText: {
    color: "#c3cee4ff",
    marginTop: 15,
    fontSize: 13,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#ff000022",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },

  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    padding: 5
  },

  divider: {
    color: "#777",
    marginVertical: 22,
  },

  registerText: {
    color: "#1DB954",
    fontSize: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1DB954",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});