import { publicApi as api } from "./conexion/axiosConfig.js";

export const fetchSongs = async () => {
    try {
        const response = await api.get("/songs/");
        return response.data;
    } catch (error) {
        throw error;
    }
};