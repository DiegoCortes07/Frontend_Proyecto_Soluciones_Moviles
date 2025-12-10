import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const SocialButton = ({ text, icon, onPress }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.socialContent}>
        {icon && (
          <Image
            source={{ uri: icon }}
            style={{ width: 22, height: 22, marginRight: 12 }}
          />
        )}
        <Text style={styles.socialText}>{text}</Text>
      </View>
    </Pressable>
  );

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

        <Text style={styles.title}>Crea tu cuenta</Text>

        {/* Botones sociales */}
        <SocialButton
          text="Continuar con Email"
          icon="https://cdn-icons-png.flaticon.com/512/732/732200.png"
          onPress={() => navigation.navigate("RegisterEmail")}
        />

        <SocialButton
          text="Continuar con Teléfono"
          icon="https://cdn-icons-png.flaticon.com/512/724/724664.png"
        />

        <SocialButton
          text="Continuar con Google"
          icon="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        />

        <SocialButton
          text="Continuar con Apple"
          icon="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
        />

        {/* Link a iniciar sesión */}
        <TouchableOpacity
          style={{ marginTop: 35 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginLink}>
            ¿Ya tienes una cuenta?
            <Text style={{ color: "#1DB954", fontWeight: "600" }}> Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gradientTop: {
    position: "absolute",
    top: -100,
    height: 250,
    width: "100%",
    backgroundColor: "#1DB95433",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    zIndex: -1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 25,
    paddingTop: 80,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    marginBottom: 20,
    opacity: 0.9,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 35,
  },

  socialButton: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2b2b2b",
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  socialContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  loginLink: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
  },
});
