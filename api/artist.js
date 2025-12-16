import api from "./conexion/axiosConfig.js";

export const getArtistForId = async (artistId) => {
    try {
        const response = await api.get(`/artists/${artistId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}