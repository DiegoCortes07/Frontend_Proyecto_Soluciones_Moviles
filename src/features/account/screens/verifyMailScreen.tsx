import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ImageBackground } from "react-native";
import { validateEmail } from "../../../../api/auth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">
export default function VerifyMail(){
  const param = useRoute().params as {token: string | undefined};
  const [message, setMessage] = useState("Ahora puedes iniciar sesión \n en tu cuenta de Tunesly");
  const navigation = useNavigation<NavProp>();
  const [counter, setCounter] = useState(5);

  const validMail = () => {
      validateEmail(param)
    .then((data) =>{
      console.log(data);
    })
    .catch((error)=>{
      console.error("Error en el servidor:", error.response?.data || error.message);
      setMessage("Ha ocurrido un error, no se pudo confirmar tu email.");
    });
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    if(counter === 5){
      validMail();
    }

    if (counter === 0) {
      clearInterval(interval);
      navigation.replace("Login"); // <- Redirige a login
    }

    return () => clearInterval(interval);
  }, [counter]);

  return (
    <View style={styles.container}>
      {/* Caja verde */}
      <View style={styles.successBox}></View>
      <Text style={styles.successText}>Email confirmado!</Text>
      <Text style={styles.subtitle}>
        {message}
      </Text>

      {/* Caja contador */}
      <View style={styles.counterBox}>
        <Text style={styles.redirectText}>Redireccionando en..</Text>
        <Text style={styles.counter}>{counter}</Text>
        <Text style={styles.seconds}>Segundos</Text>
      </View>
      <ImageBackground
        source={{ uri: "https://png.pngtree.com/png-vector/20220606/ourmid/pngtree-waved-music-notes-wave-line-sound-vector-png-image_530490.png" }}
        style={{ width: "100%", height:"90%", opacity: 0.2, bottom:"30%",zIndex:-1}}>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // fondo negro
    alignItems: "center",
    paddingTop: 70,
  },
  successBox: {

    position: "absolute",
    top: -100,
    height: 250,
    width: "90%",
    backgroundColor: "#3AAA35",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: -1,
  },
  successText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 60,
  },
  counterBox: {
    marginTop: 50,
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 60,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#555",
  },
  redirectText: {
    color: "#ccc",
    fontSize: 20,
    marginBottom: 10,
  },
  counter: {
    color: "white",
    fontSize: 60,
    fontWeight: "bold",
  },
  seconds: {
    color: "#ccc",
    marginTop: 5,
    fontSize: 18,
  },
});