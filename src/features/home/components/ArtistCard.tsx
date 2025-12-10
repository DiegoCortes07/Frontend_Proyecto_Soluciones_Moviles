import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Artist from "../../../interfaces/Artist";

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

interface ArtistCardProps {
  artist: Artist | null;
  artistName: string;
  onPress: () => void;
  onLongPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  artistName,
  onPress,
  onLongPress,
}) => {
  const getArtistImage = () => artist?.image || defaultAvatar;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: getArtistImage() }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.name} numberOfLines={1}>
          {artistName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  content: {
    alignItems: "center",
    width: 120,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    color: "#fff",
    marginTop: 6,
    maxWidth: 120,
    textAlign: "center",
  },
});
