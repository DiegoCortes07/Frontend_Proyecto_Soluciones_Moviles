import { environment } from "../../environments/environment";

export async function api<T = unknown>(path: string, init: RequestInit = {}) {
  try {
    const url = `${environment.apiUrl}${path}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        ...(init.headers || {}) 
      },
      ...init,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (res.status === 204) {
      return undefined as unknown as T;
    }
    
    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor en ${environment.apiUrl}`);
      }
      throw error;
    }
    throw new Error('Error desconocido en la petición HTTP');
  }
}
