import api from "./conexion/axiosConfig.js";

export const login = async (email, password) => {
    try {
        const response = await api.post("/users/login", { email, password });

        return response.data;

    } catch (error) {
        if (error.response) {
            throw new Error("Error en el inicio de sesión");
        }
        else {
            throw error;
        }
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await api.post('/users/register', {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const me = async (token) => {
    try {
        const response = await api.get('/users/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};