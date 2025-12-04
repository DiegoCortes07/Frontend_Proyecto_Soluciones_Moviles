import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../app/navigation/RootNavigator";
import { useAuth } from "../../contexts/AuthContext";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Library">;

const AppLayout: React.FC<{
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string;
}> = ({ children, onLogout, userName = "Usuario" }) => {
  const navigation = useNavigation<NavProp>();
  const [openMenu, setOpenMenu] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const auth = useAuth();

  const currentRouteName = useNavigationState((state) => {
    if (!state) return "";
    const route = state.routes[state.index];
    return route?.name ?? "";
  });

  const handleLogout = () => {
    auth.logout();
    onLogout?.();
    navigation.navigate("Login" as never);
  };

  const resolvedName = auth.user?.username || userName;

  return (
    <View style={styles.wrapper}>
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.logoWrap}>
          <Image
            source={{ uri: 'data:image/svg+xml;utf8,<svg xmlns="https://icones.pro/wp-content/uploads/2021/04/icone-spotify-bleue.png" width="80" height="80" viewBox="0 0 100 100"><rect rx="18" width="100" height="100" fill="%23071428" /><g transform="translate(18,22)"><circle cx="22" cy="18" r="12" fill="%231DB9FF"/><rect x="46" y="12" width="26" height="12" rx="6" fill="%239fd6ff"/></g></svg>' }}
            style={styles.logoImage}
            accessibilityLabel="app-logo"
          />
          <Text style={styles.logoText}>SpotifyClone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentRouteName === "Home" ? styles.navActive : undefined]}
          onPress={() => navigation.navigate("Home" as never)}
        >
          <Icon name="home" size={18} color="#fff" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentRouteName === "Library" ? styles.navActive : undefined]}
          onPress={() => navigation.navigate("Library" as never)}
        >
          <Icon name="book" size={18} color="#eaf6ff" />
          <Text style={styles.navText}>Tu biblioteca</Text>
        </TouchableOpacity>

        <View style={{ width: "100%" }}>
          <TouchableOpacity
            style={[styles.navItem]}
            onPress={() => setProfileMenuOpen((p) => !p)}
            accessibilityLabel="nav-mi-perfil"
          >
            <Icon name="user" size={16} color="#eaf6ff" />
            <Text style={styles.navText}>Mi perfil</Text>
          </TouchableOpacity>

          {profileMenuOpen && (
            <View style={[styles.userMenu, { marginTop: 6, paddingVertical: 4 }]}> 
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setProfileMenuOpen(false);
                  navigation.navigate("Home" as never);
                }}
              >
                <Text style={styles.menuText}>Ver perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setProfileMenuOpen(false);
                  navigation.navigate("Home" as never);
                }}
              >
                <Text style={styles.menuText}>Ajustes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setProfileMenuOpen(false);
                  handleLogout();
                }}
              >
                <Text style={[styles.menuText, { color: "#ffdddd" }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#071428",
  },
  sidebar: {
    width: 220,
    paddingTop: 28,
    paddingHorizontal: 12,
    backgroundColor: "#071428",
    borderRightWidth: 1,
    borderRightColor: "#133b63",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    color: "#eaf6ff",
    fontWeight: "700",
    fontSize: 16,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    width: "100%",
    borderRadius: 6,
    marginBottom: 6,
  },
  navActive: {
    backgroundColor: "#0b3b5a",
    borderRadius: 6,
    paddingLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  navText: {
    color: "#eaf6ff",
    marginLeft: 8,
    fontSize: 13,
  },
  userWrap: {
    width: "100%",
    marginBottom: 12,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    width: "100%",
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 8,
  },
  userName: {
    color: "#eaf6ff",
    fontSize: 14,
    maxWidth: 120,
  },
  userMenu: {
    marginTop: 8,
    backgroundColor: "#061a2a",
    borderRadius: 8,
    paddingVertical: 6,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  menuText: {
    color: "#eaf6ff",
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    color: "#9fd6ff",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 6,
  },
});

export default AppLayout;
