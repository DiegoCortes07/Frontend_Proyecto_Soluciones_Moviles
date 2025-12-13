import { useEffect } from "react";
import { useLoadData } from "../hooks/appStorage";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";

export default function StartLoadScreen (){
  const navigation = useNavigation();
  const { setToken } = useAuth();

    useEffect(()=>{
        useLoadData("session")
        .then((data) => {
            setToken(data)
            navigation.navigate("Home" as never);
        })
        .catch((err)=>{
            console.log(err);
            navigation.navigate("Login" as never);
        })
            

    },[]);

    return (
            <View style={styles.backgroundContainer}>
              <Image source={{ uri: 'https://icones.pro/wp-content/uploads/2021/04/icone-spotify-bleue.png'}}
                  style={styles.profileImage}>
              </Image>
              <ActivityIndicator size="large" color="#1285e4ff" style={styles.loader} />
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
  loader: {
    marginVertical: 12,
  },
  profileImage: {
    width: "40%",
    height: "20%", 
  },
})
