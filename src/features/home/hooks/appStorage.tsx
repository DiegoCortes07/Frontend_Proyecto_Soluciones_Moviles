import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSaveData = async (key: string,value: string) =>{
    try {
        await AsyncStorage.setItem(key,value);
        console.log(`Dato ${key} Guardado.`)
    } catch (error) {
        throw error;
    }
}
export const useLoadData = async (key: string) =>{
    try {
        const item = await AsyncStorage.getItem(key);
        if(!item){
            throw ReferenceError;
        }
        return item;
    } catch (error) {
        throw error;
    }
}
export const useDeleteData = async (key: string) =>{
    try {
        await AsyncStorage.removeItem(key);
        console.log(`Dato ${key} Borraddo.`)
    } catch (error) {
        throw error;
    }
}