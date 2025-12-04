  import React, { useEffect, useState } from "react";
  import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
  } from "react-native";
    import AppLayout from "../../../components/layout/AppLayout";
    import { useAuth } from "../../../contexts/AuthContext";
    import { ActivityIndicator } from "react-native";

  const playlists = [
    { id: 1, title: "Chill Vibes", image: "https://picsum.photos/seed/p1/200" },
    { id: 2, title: "Workout", image: "https://picsum.photos/seed/p2/200" },
    { id: 3, title: "Favorites", image: "https://picsum.photos/seed/p3/200" },
  ];

  const likes = [
    { id: 1, title: "Liked Songs", image: "https://picsum.photos/seed/l1/200" },
    { id: 2, title: "Top 2025", image: "https://picsum.photos/seed/l2/200" },
  ];

  export default function Library() {
      const { user, token, loading } = useAuth();

      const content = (
        <View style={styles.container}>
          <Text style={styles.title}>Tu Biblioteca</Text>
          <Text style={styles.section}>Playlists</Text>
          <FlatList
            horizontal
            data={playlists}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />

          <Text style={[styles.section, { marginTop: 18 }]}>Me gusta</Text>
          <FlatList
            horizontal
            data={likes}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );

      if (loading) {
        return <ActivityIndicator size="large" color="#1DB954" style={{ flex: 1 }} />;
      }

      return (
        <AppLayout userName={user?.username}>
          {content}
        </AppLayout>
      );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#071428" },
    title: {
      color: "#eaf6ff",
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 12,
    },
    section: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
    card: { width: 140, marginRight: 12, alignItems: "center" },
    image: { width: 140, height: 140, borderRadius: 12 },
    cardTitle: { color: "#fff", marginTop: 8, textAlign: "center" },
    backButton: { marginBottom: 12 },
    backButtonText: { color: "#1DB954", fontSize: 16 },
  });
