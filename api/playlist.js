import api from "./conexion/axiosConfig.js";

export const createPlaylist = async (token, name, description) => {
  try {
    const response = await api.post(
      "/playlists/",
      {
        name,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

export const fetchUserPlaylists = async (token) => {
  try {
    const response = await api.get("/playlists/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    throw error;
  }
};

export const addSongToPlaylist = async (token, playlistId, songId) => {
  try {
    const response = await api.post(
      `/playlists/${playlistId}/songs`,
      {
        songId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    throw error;
  }
};

export const getPlaylistSongs = async (playlistId) => {
  try {
    const response = await api.get(`/playlists/${playlistId}/songs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (token, playlistId, songId) => {
  try {
    const response = await api.delete(
      `/playlists/${playlistId}/songs/${songId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    throw error;
  }
};

export const deletePlaylist = async (token, playlistId) => {
  try {
    const response = await api.delete(`/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
};

export const uploadPlaylistImage = async (token, playlistId, imageFile) => {
  try {
    // Validar que el archivo tenga los datos necesarios
    if (!imageFile || !imageFile.uri) {
      throw new Error("Archivo de imagen inválido");
    }

    if (!token) {
      throw new Error("Token de autenticación no disponible");
    }

    // Construir FormData con el archivo
    const formData = new FormData();
    formData.append("image", {
      uri: imageFile.uri,
      name: imageFile.name || "playlist_image.png",
      type: imageFile.type || "image/png",
    });

    console.log("Uploading image:", {
      playlistId,
      fileName: imageFile.name,
      fileType: imageFile.type,
    });

    const response = await api.post(
      `/playlists/${playlistId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Image uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading playlist image:", error);
    let errorMessage = "Error al subir la imagen";

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        `Error del servidor (${error.response.status})`;
      console.error("Server error response:", error.response.data);
    } else if (error.request) {
      errorMessage = "No hay conexión con el servidor";
      console.error("Network error:", error.request);
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const changePlaylistDetails = async (
  token,
  playlistId,
  name,
  description
) => {
  try {
    const response = await api.put(
      `/playlists/${playlistId}`,
      {
        name,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing playlist details:", error);
    throw error;
  }
};
