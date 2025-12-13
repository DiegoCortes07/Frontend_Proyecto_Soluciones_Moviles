import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const isMobileView = screenWidth < 768;

interface ProfileHeaderProps {
  user: {
    username: string;
    profilePhoto?: string;
    alias: string;
  };
}

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  if (isMobileView) return null;
  const hasAlias = !!user.alias;
  return (
    <View style={styles.profileContainer}>
      <Image
        source={{ uri: user.profilePhoto || defaultAvatar }}
        style={styles.profileImage}
      />
      {hasAlias ? (
        <Text style={styles.profileName}>Bienvenido, {user.alias}!</Text>
      ): (
        <Text style={styles.profileName}>Bienvenido, {user.username}!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#0f1d38",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1c2f55",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  profileImage: { width: 50, height: 50, borderRadius: 50, marginRight: 10 },
  profileName: { color: "#f4f8ff", fontSize: 18, fontWeight: "800" },
});
