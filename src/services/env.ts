import Constants from "expo-constants";

type Extra = { API_URL?: string };
const extra = (Constants?.expoConfig?.extra ?? {}) as Extra;

const getDerivedHostApi = (): string => {
	const hostUri = Constants?.expoConfig?.hostUri || (Constants as any)?.manifest?.hostUri;
	if (!hostUri) return "http://localhost:8080/api";

	const host = hostUri.split(":")[0];
	if (!host) return "http://localhost:8080/api";

	return `http://${host}:8080/api`;
};

export const API_URL =
	process.env.EXPO_PUBLIC_API_URL ||
	extra.API_URL ||
	getDerivedHostApi();
