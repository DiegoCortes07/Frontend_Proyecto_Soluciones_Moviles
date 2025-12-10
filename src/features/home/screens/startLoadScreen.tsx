import { useEffect } from "react";
import { useLoadData } from "../hooks/appStorage";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function StartLoadScreen (){
  const navigation = useNavigation();

    useEffect(()=>{
        useLoadData("session")
        .then((data) => {
            navigation.navigate("Home" as never);
        })
        .catch((err)=>{
            console.log(err);
            navigation.navigate("Login" as never);
        })
            

    },[]);

    return (
            <View style={styles.backgroundContainer}>
                <Text> Cargando...</Text>
            </View>
    );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#19181bff",
    justifyContent: "center",
    alignItems: "center",
  },
})
