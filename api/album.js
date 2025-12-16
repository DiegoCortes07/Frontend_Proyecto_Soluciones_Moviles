import api from "./conexion/axiosConfig.js";

export const fetchAlbums = async () => {
    try {
        const response = await api.get("/albums/");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchSongsByAlbum = async (albumId) => {
    try {
        const response = await api.get(`/albums/${albumId}/songs/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAlbumDetails = async (albumId) => {
    try {
        const response = await api.get(`/albums/${albumId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};