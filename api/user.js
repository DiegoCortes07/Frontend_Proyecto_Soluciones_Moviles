import api from "./conexion/axiosConfig.js";

export const changeConfig = async (userId, newConfig) => {
    try {
        const response = await api.put(`/users/change-config`, {
            userId: userId,
            configUpdates: newConfig
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};
