import api from "./conexion/axiosConfig.js";

export const likeSong = async (token, songId) => {
    try {
        const response = await api.post(`/users/like-song/${songId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getLikedSongs = async (token) => {
    try {
        const response = await api.get('/users/liked-songs', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
