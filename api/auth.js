import { publicApi as api, authApi } from "./conexion/axiosConfig.js";

export const login = async (email, password) => {
    try {
        const response = await api.post("/users/login", { email, password });

        return response.data;

    } catch (error) {
        if (error.response.data.blocked) {
            throw new Error("Cuenta inhabilitada");
        }
        else if (error.response){
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

export const updateUserData = async (formData) =>{
    try {
        let token = "";
        await AsyncStorage.getItem("Session")
            .then((data)=>{token=data;})
            .catch((err)=>{console.log(err);})
        const response = await authApi.put('/users/updateprofile', formData, {
            headers: {"Content-Type":"multipart/form-data", "Authorization": `Bearer ${token}`}
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}   
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
}
export const validateEmail = async (token) =>{
    try {
        const response = await api.post('/users/verifmail', {token});
        return response.data;

    } catch (error) {
        throw(error);
    }
};