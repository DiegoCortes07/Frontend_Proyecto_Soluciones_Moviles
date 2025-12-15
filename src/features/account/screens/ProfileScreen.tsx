import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import AppLayout from "../../../components/layout/AppLayout";

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

export default function ProfileScreen() {
  const auth = useAuth();
  const { theme } = useTheme();
  const user = auth.user;
  const styles = getStyles(theme);

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.container}>
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout userName={user.username}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Mi Perfil</Text>
          
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.urlProfilePhoto || defaultAvatar }}
              style={styles.profileImage}
            />
            
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre de usuario:</Text>
                <Text style={styles.value}>{user.username}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Correo electrónico:</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Plan:</Text>
                <Text style={[styles.value, styles.planBadge]}>{user.plan}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#1DB9FF",
  },
  infoContainer: {
    width: "100%",
    maxWidth: 500,
  },
  infoRow: {
    backgroundColor: theme.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  label: {
    fontSize: 14,
    color: theme.textTertiary,
    marginBottom: 6,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: "500",
  },
  planBadge: {
    backgroundColor: "#1DB9FF",
    color: "#071428",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "bold",
    alignSelf: "flex-start",
    textTransform: "uppercase",
  },
  errorText: {
    color: theme.error,
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});
