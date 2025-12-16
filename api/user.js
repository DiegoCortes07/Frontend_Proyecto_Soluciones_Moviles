import api from "./conexion/axiosConfig.js";

export const changeConfig = async (userId, newConfig) => {
    try {
        const response = await api.put(`/users/change-config`, {
            userId: userId,
            configUpdates: newConfig,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changePassword = async (token, newPassword) => {
    try {
        const response = await api.put(
            `/users/change-password`,
            { newPassword: newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeProfilePhoto = async (userId, photoFile) => {
    try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("file", photoFile);

        const response = await api.post(`/users/change-profile-photo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeUserData = async (token, newUserData) => {
    try {
        const response = await api.put(`/users/change-userdata`, newUserData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeUserImage = async (token, newImage) => {
    try {
        const response = await api.put(`/users/change-image`, newImage, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
