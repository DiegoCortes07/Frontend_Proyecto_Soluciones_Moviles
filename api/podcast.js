import api from "./conexion/axiosConfig.js";

export const getAllShowPodcasts = async () => {
    try {
        const response = await api.get("/podcasts/getAllShows");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllPodcasts = async () => {
    try {
        const response = await api.get("/podcasts/");
        return response.data;
    }
    catch (error) {
        throw error;
    }
};

export const getShowsForPodcastId = async (podcastId) => {
    try {
        const response = await api.get(`/podcasts/getShowsForPodcastId/${podcastId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};