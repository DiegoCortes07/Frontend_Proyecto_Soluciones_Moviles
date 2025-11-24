import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import soundIcon from "../../../assets/images/sound-icon.png"; // Ruta correcta de la imagen

export default function Player() {
  const route = useRoute();
  const navigation = useNavigation();
  const { song } = route.params;  // Obtenemos la canción seleccionada
  
  const [isPlaying, setIsPlaying] = useState(false); // Estado de reproducción

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying); // Cambiar estado entre reproducir y pausar
  };

  return (
    <View style={styles.container}>
      {/* Botón Volver Atrás */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      {/* Imagen de la canción */}
      <Image source={soundIcon} style={styles.songImage} />

      {/* Título y Artista de la canción */}
      <Text style={styles.songTitle}>{song.title}</Text>
      <Text style={styles.songArtist}>{song.artistName}</Text>

      {/* Contenedor del botón de reproducción */}
      <View style={styles.buttonContainer}>
        {/* Botón Reproducir/Pausar */}
        <TouchableOpacity 
          style={[styles.button, isPlaying ? styles.pauseButton : styles.playButton]} 
          onPress={togglePlayPause}
        >
          <Text style={styles.buttonText}>{isPlaying ? "Pausar" : "Reproducir"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: "#1DB954",
    borderRadius: 30,
    zIndex: 1,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  songImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  songTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  songArtist: {
    color: "#bbb",
    fontSize: 18,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: "column",  // Botones centrados verticalmente
    alignItems: "center",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 40,  // Espacio en la parte inferior
    width: "100%",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: "#1DB954",  // Color verde para el botón de reproducción
  },
  pauseButton: {
    backgroundColor: "#FF5722",  // Color rojo para el botón de pausa
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
