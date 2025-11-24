import Constants from "expo-constants";

type Extra = { API_URL?: string };
const extra = (Constants?.expoConfig?.extra ?? {}) as Extra;

export const API_URL = extra.API_URL ?? "http://localhost:3000";
