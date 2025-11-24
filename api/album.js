import api from "./axiosConfig.js";

export const fetchAlbums = async () => {
    try {
        const response = await api.get("/albums/");
        return response.data;
    } catch (error) {
        throw error;
    }
};