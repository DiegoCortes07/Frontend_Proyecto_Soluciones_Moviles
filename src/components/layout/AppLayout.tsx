import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../app/navigation/RootNavigator";
import { useAuth } from "../../contexts/AuthContext";
import NowPlayingBar from "../NowPlayingBar";
import { usePlayer } from "../../contexts/PlayerContext";
import { useTheme } from "../../contexts/ThemeContext";

// Declarar window para TypeScript en web
declare const window: any;

type NavProp = NativeStackNavigationProp<RootStackParamList, "Library">;

const AppLayout: React.FC<{
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string;
}> = ({ children, onLogout, userName = "Usuario" }) => {
  const navigation = useNavigation<NavProp>();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const currentRouteName = useNavigationState((state) => {
    if (!state) return "";
    const route = state.routes[state.index];
    return route?.name ?? "";
  });

  const handleLogout = async () => {
    // Mostrar confirmación antes de cerrar sesión
    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        await player.stopAndCleanup();
        auth.logout();
        onLogout?.();
        navigation.navigate("Login" as never);
      }
    } else {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar sesión",
            style: "destructive",
            onPress: async () => {
              await player.stopAndCleanup();
              auth.logout();
              onLogout?.();
              navigation.navigate("Login" as never);
            },
          },
        ]
      );
    }
  };

  const player = usePlayer();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.wrapper}>
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.logoWrap}>
          <Image
            source={{ uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100"><rect rx="18" width="100" height="100" fill="%23071428" /><g transform="translate(18,22)"><circle cx="22" cy="18" r="12" fill="%231DB9FF"/><rect x="46" y="12" width="26" height="12" rx="6" fill="%239fd6ff"/></g></svg>' }}
            style={styles.logoImage}
            accessibilityLabel="app-logo"
          />
          <Text style={styles.logoText}>SpotifyClone</Text>
        </TouchableOpacity>

        <View style={styles.navRow}>
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

          <TouchableOpacity
            style={[styles.navItem, currentRouteName === "Plan" ? styles.navActive : undefined]}
            onPress={() => navigation.navigate("Plan" as never)}
          >
            <Icon name="star" size={18} color="#1DB954" />
            <Text style={styles.navText}>Plan</Text>
          </TouchableOpacity>

          <View style={{ width: "100%", flex: isMobileView ? 1 : 0 }}>
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
                    navigation.navigate("Profile" as never);
                  }}
                >
                  <Text style={styles.menuText}>Ver perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setProfileMenuOpen(false);
                    navigation.navigate("Settings" as never);
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
        </View>

        <View style={{ flex: 1 }} />
      </View>

      <View style={[styles.content, { paddingBottom: isMobileView ? 150 : 115 }]}>{children}</View>

      <NowPlayingBar
        song={player.song}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        onPlayPause={player.togglePlayPause}
        onPrev={player.prev}
        onNext={player.next}
        onSeek={player.seek}
        onToggleFavorite={player.toggleFavorite}
        onAddToPlaylist={player.addToPlaylist}
        isFavorited={player.song ? player.isFavorited(player.song.id) : false}
        style={{ marginBottom: insets.bottom }}
      />
    </View>
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get("window");
const isMobileView = screenWidth < 600;

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  wrapper: {
    flex: 1,
    flexDirection: isMobileView ? "column" : "row",
    backgroundColor: theme.background,
  },
  sidebar: {
    width: isMobileView ? "100%" : 220,
    paddingTop: isMobileView ? 12 : 28,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
    borderRightWidth: isMobileView ? 0 : 1,
    borderBottomWidth: isMobileView ? 1 : 0,
    borderRightColor: theme.border,
    borderBottomColor: isMobileView ? theme.border : "transparent",
    alignItems: isMobileView ? "stretch" : "flex-start",
    maxHeight: isMobileView ? "auto" : "100%",
    shadowColor: theme.shadow,
    shadowOffset: { width: isMobileView ? 0 : 4, height: isMobileView ? 2 : 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: isMobileView ? 2 : 6,
  },
  navRow: {
    flexDirection: isMobileView ? "row" : "column",
    alignItems: "center",
    justifyContent: isMobileView ? "space-between" : "flex-start",
    width: "100%",
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
    color: theme.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isMobileView ? 8 : 10,
    paddingHorizontal: 8,
    width: isMobileView ? "100%" : "100%",
    flex: isMobileView ? 1 : 0,
    borderRadius: 8,
    marginBottom: isMobileView ? 0 : 6,
  },
  navActive: {
    backgroundColor: theme.backgroundElevated,
    borderRadius: 6,
    paddingLeft: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  navText: {
    color: theme.textPrimary,
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
    color: theme.textPrimary,
    fontSize: 14,
    maxWidth: 120,
  },
  userMenu: {
    marginTop: 8,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 6,
    width: "100%",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
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
    color: theme.textPrimary,
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: isMobileView ? 8 : 16,
    backgroundColor: theme.background,
  },
  footer: {
    color: theme.textTertiary,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 6,
  },
});

export default AppLayout;
