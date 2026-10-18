# 🎵 Tunesly — Frontend (App móvil)

Aplicación **móvil multiplataforma (Android · iOS · Web)** tipo Spotify, construida con **React Native + Expo + TypeScript**. Permite explorar un catálogo de música y podcasts, reproducir audio, marcar favoritos y gestionar playlists contra la API REST del proyecto.

> 🖥 El servidor está en el repositorio hermano **`Backend_Proyecto_Soluciones_Moviles`**.
> 📦 Para una visión general del proyecto completo (los dos repositorios juntos), ver **[PROYECTO.md](./PROYECTO.md)**.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)

---

## 📑 Tabla de contenido

1. [Sobre el proyecto](#-sobre-el-proyecto)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Configuración](#-configuración)
5. [Instalación y ejecución](#-instalación-y-ejecución)
6. [Pantallas y navegación](#-pantallas-y-navegación)
7. [Estado global (contextos)](#-estado-global-contextos)
8. [Capa de acceso a datos](#-capa-de-acceso-a-datos)
9. [Funcionalidades destacadas](#-funcionalidades-destacadas)
10. [Notas y mejoras pendientes](#-notas-y-mejoras-pendientes)
11. [Autores](#-autores)

---

## 📖 Sobre el proyecto

**Tunesly** es un clon de Spotify desarrollado como proyecto académico del curso **Soluciones Móviles** (Universidad Católica del Norte), en equipo de dos personas. La app cubre el ciclo completo de un cliente de streaming:

- **Autenticación** (registro, login, verificación de correo)
- **Exploración** de canciones, álbumes, artistas y podcasts con búsqueda y filtro por género
- **Reproductor global** con cola, avance automático, seek y mini-reproductor expandible
- **Biblioteca** personal: canciones favoritas y playlists (crear, editar, portada, agregar/quitar canciones)
- **Perfil y ajustes**: cambio de datos/contraseña/foto, tema claro-oscuro, idioma, filtro de contenido explícito y gestión de plan

La interfaz es responsiva y se adapta tanto a pantallas de móvil como a la versión web en escritorio.

---

## 🛠 Stack tecnológico

| Área | Tecnología |
| --- | --- |
| Framework | **Expo SDK 54** + **React Native 0.81** |
| Lenguaje | **TypeScript** 5.9 (con `strict: true`) |
| UI runtime | **React 19** |
| Navegación | **React Navigation 7** (`native-stack`) |
| Audio | **expo-audio** (`useAudioPlayer`) |
| HTTP | **axios** (capa `api/`) y `fetch` (capa `src/services/`) |
| Caché de datos | **@tanstack/react-query** (configurado en `App.tsx`) |
| Estilos | `StyleSheet` + temas propios (objetos de tema claro/oscuro) |
| Gestos/animación | `react-native-gesture-handler`, `react-native-reanimated`, `Animated`/`PanResponder` |
| Multimedia | `expo-image`, `expo-image-picker`, `expo-av` (ver notas) |
| Iconografía | `react-native-vector-icons` (`FontAwesome`) |

---

## 🗂 Estructura del proyecto

```
Frontend_Proyecto_Soluciones_Moviles/
├── App.tsx                        # Raíz: providers (SafeArea, React Query, Auth, Theme) + NavigationContainer
├── index.js                       # registerRootComponent(App)
├── app.json                       # Configuración de Expo (nombre, iconos, plugins)
├── babel.config.js                # babel-preset-expo
├── tailwind.config.js             # Sin uso (ver notas)
├── tsconfig.json
├── .env                           # EXPO_PUBLIC_API_URL
│
├── api/                           # Capa de acceso a la API con axios
│   ├── conexion/axiosConfig.js    # Instancia de axios (baseURL + interceptor de Content-Type)
│   ├── auth.js                    # login, register, me
│   ├── user.js                    # changeConfig, changePassword, changeUserData, imágenes
│   ├── songs.js   album.js   artist.js
│   ├── like.js                    # likeSong, getLikedSongs
│   ├── playlist.js                # CRUD de playlists y sus canciones
│   └── podcast.js                 # shows y episodios
│
├── environments/
│   ├── environment.ts             # { production, apiUrl, apiTimeout }
│   └── environment.prod.ts
│
├── assets/                        # icon.png, adaptive-icon.png, splash-icon.png
│
└── src/
    ├── app/navigation/RootNavigator.tsx     # Stack + tipos de rutas (RootStackParamList)
    ├── components/
    │   ├── layout/AppLayout.tsx             # Shell: sidebar, navegación, menú de perfil, logout
    │   ├── NowPlayingBar.tsx                # Mini-reproductor + modal "Reproduciendo" expandible
    │   └── PlaylistPicker.tsx               # Modal para agregar canción / gestionar playlists
    ├── constants/Color.ts
    ├── contexts/
    │   ├── AuthContext.tsx                  # token, usuario, loading, logout, refreshUser
    │   ├── PlayerContext.tsx                # reproductor global + favoritos + playlists
    │   └── ThemeContext.tsx                 # tema claro/oscuro derivado del usuario
    ├── features/
    │   ├── account/screens/
    │   │   ├── Auth/loginScreen.tsx
    │   │   ├── Auth/registerScreen.tsx
    │   │   ├── Auth/registerEmailScreen.tsx
    │   │   ├── ProfileScreen.tsx
    │   │   ├── SettingsScreen.tsx
    │   │   └── PlanScreen.tsx
    │   ├── Album/screens/album.tsx          # Detalle de álbum (y de podcast)
    │   └── home/
    │       ├── screens/home.tsx             # Inicio: catálogo, búsqueda, filtros
    │       ├── screens/Library.tsx          # Biblioteca: favoritos y playlists
    │       └── components/                  # AlbumCard, ArtistCard, PodcastCard, SongCard,
    │           ├── HomeLeftColumn.tsx          SearchBar, GenreChips, *List,
    │           ├── library/                    ProfileHeader, ArtistDetailModal…
    │           │   ├── PlaylistCard.tsx        (PlaylistModal, EditPlaylistModal,
    │           │   ├── LikedSongCard.tsx        LikedSongsModal, PlaylistSongRow)
    │           │   └── …
    │           └── …
    ├── interfaces/                  # Tipos del dominio (Song, Album, Artist, Playlist, Podcast, User, Like)
    ├── services/
    │   ├── env.ts                   # Resuelve la URL de la API (env → extra → host de Expo)
    │   └── http.ts                  # Helper fetch genérico
    └── utils/
        ├── explicitFilter.ts        # Filtra canciones explícitas según el usuario
        └── imageHelper.ts           # Normaliza URLs de imagen (getSongImageUrl)
```

---

## ⚙️ Configuración

La URL de la API se resuelve, según el archivo que la consuma, en **tres lugares distintos**:

| Archivo | Uso |
| --- | --- |
| `.env` → `EXPO_PUBLIC_API_URL` | Leído por `src/services/env.ts` (`API_URL`) |
| `environments/environment.ts` → `apiUrl` | Leído por `src/services/http.ts` |
| `api/conexion/axiosConfig.js` → `API_URL` | `baseURL` de la instancia de **axios** usada por toda la carpeta `api/` |

> ⚠️ **Importante**: si tu servidor no está en la misma IP que la configurada, la app no cargará datos. Ajusta **las tres** referencias a la dirección correcta (por ejemplo, la IP local de tu PC donde corre el backend).

### Ejemplo de `.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.0.20:8080/api
```

El backend debe estar escuchando en `0.0.0.0` para que el dispositivo o emulador pueda alcanzarlo.

---

## 🚀 Instalación y ejecución

### Requisitos

- Node.js `18+`
- npm
- La app **Expo Go** en tu teléfono, o un emulador de Android/iOS

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la URL de la API (ver sección anterior)

# 3. Iniciar el proyecto
npm start
```

Desde el menú de Expo puedes abrir la app en:

- **Expo Go** (escanear el QR)
- **Emulador de Android** (`npm run android`)
- **Simulador de iOS** (`npm run ios`, solo macOS)
- **Navegador web** (`npm run web`)

### Scripts disponibles

| Script | Acción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm run android` | Abre la app en un dispositivo/emulador Android |
| `npm run ios` | Abre la app en el simulador de iOS |
| `npm run web` | Abre la app en el navegador |
| `npm run lint` | Ejecuta ESLint (`eslint-config-expo`) |
| `npm run reset-project` | *(script de plantilla de Expo, no aplica a este proyecto)* |

---

## 📱 Pantallas y navegación

La navegación es un **stack** definido en `src/app/navigation/RootNavigator.tsx` (sin cabecera, `headerShown: false`):

| Ruta | Pantalla | Descripción |
| --- | --- | --- |
| `Login` | `loginScreen` | Inicio de sesión con validación de email y contraseña |
| `Register` | `registerScreen` | Registro (punto de entrada) |
| `RegisterEmail` | `registerEmailScreen` | Registro con email + validaciones de contraseña |
| `Home` | `home` | Inicio: canciones, álbumes, podcasts, búsqueda y filtro por género |
| `Library` | `Library` | Biblioteca: canciones favoritas y playlists |
| `Album` | `album` | Detalle de álbum o de show de podcast (`{ id }`) |
| `Profile` | `ProfileScreen` | Perfil: datos, foto y cambio de contraseña |
| `Settings` | `SettingsScreen` | Ajustes: tema, idioma, contenido explícito |
| `Plan` | `PlanScreen` | Selección de plan de suscripción |

Las pantallas autenticadas se renderizan dentro de **`AppLayout`**, un shell con sidebar lateral (Inicio, Tu biblioteca, Plan, Mi perfil), logo, versión móvil/escritorio y cierre de sesión. El **`NowPlayingBar`** se integra en ese layout, por lo que el reproductor persiste entre pantallas.

---

## 🧠 Estado global (contextos)

| Contexto | Responsabilidad |
| --- | --- |
| **`AuthContext`** | Guarda el `token` y el `user`; carga el perfil con `me(token)`; expone `logout`, `refreshUser` y `updateUser` |
| **`PlayerContext`** | Reproductor global: `song`, `isPlaying`, `currentTime`, `duration`, `playlist`, y acciones `playQueue`, `playSong`, `togglePlayPause`, `prev`, `next`, `seek`. También maneja **favoritos** (`likedSongsSet` con actualización optimista) y las **playlists** (carga, creación, alta/baja de canciones) usadas por `PlaylistPicker` |
| **`ThemeContext`** | Deriva el tema (claro/oscuro) desde `user.theme` y expone `{ theme, isDark }` y el hook `useTheme()` |

La composición de providers está en **`App.tsx`** (`SafeAreaProvider → QueryClientProvider → AuthProvider → ThemeProvider → NavigationContainer`), con `ThemeProvider` y `PlayerProvider` también anidados en `RootNavigator`.

---

## 🌐 Capa de acceso a datos

Existen **dos capas** de comunicación con la API:

1. **`api/*.js` (axios)** — Es la capa realmente usada por las pantallas. La instancia de `api/conexion/axiosConfig.js` define `baseURL` y un interceptor que elimina el `Content-Type` cuando el cuerpo es `FormData` (subida de imágenes).

   ```js
   import { fetchSongs } from "../../../../api/songs";
   const songs = await fetchSongs();          // GET /songs/
   ```

2. **`src/services/http.ts` (fetch)** — Helper genérico (`api<T>(path, init)`) con manejo de errores y de respuestas `204`, apoyado en `src/services/env.ts`. Úsalo para código nuevo con TypeScript.

Los tipos del dominio viven en **`src/interfaces/`** (`Song`, `Album`, `Artist`, `Playlist`, `Podcast`, `User`, `Like`).

---

## ✨ Funcionalidades destacadas

- **Reproductor global** con `expo-audio`: cola de reproducción, avance automático al terminar el track, barra de progreso con seek, controles anterior/siguiente y modal expandible con gesto de arrastre para cerrar.
- **Mini-reproductor persistente** (`NowPlayingBar`) integrado en el layout, visible en todas las pantallas autenticadas.
- **Favoritos optimista**: el corazón se actualiza al instante y se revierte si la API falla.
- **Playlists completas**: crear, renombrar, cambiar descripción, subir portada, agregar y quitar canciones (con `PlaylistPicker` y confirmaciones de borrado).
- **Podcasts**: listado de shows y reproducción de episodios desde la misma pantalla de detalle de álbum.
- **Búsqueda y filtro por género** sobre canciones, álbumes y podcasts, con *chips* de género.
- **Filtro de contenido explícito** (`utils/explicitFilter.ts`): si el usuario lo desactiva en ajustes, las canciones marcadas `explicit` se ocultan del catálogo.
- **Tema claro/oscuro** coherente en toda la app, **idioma** y **plan** persistidos vía la API de configuración.
- **Diseño responsivo**: layout de escritorio con sidebar y layout móvil compacto (`Dimensions` / `useWindowDimensions`).
- **Prefetch de imágenes** en Inicio para evitar parpadeos al cargar el catálogo.

---

## 📝 Notas y mejoras pendientes

Cosas detectadas al revisar el código, útiles si se retoma el proyecto:

- **URL de la API en tres lugares** (`.env`, `environments/environment.ts`, `api/conexion/axiosConfig.js`) y con IPs locales distintas entre sí. Unificar en una sola fuente (`src/services/env.ts`) y mover la capa axios a esa configuración.
- **`.env` versionado** en el repositorio con una IP privada; conviene ignorarlo y dejar un `.env.example`.
- **`console.log("Password:", password)`** en `src/features/account/screens/Auth/loginScreen.tsx`: eliminar el log de credenciales.
- **Sesión no persistida**: el token vive solo en memoria, por lo que se pierde al reiniciar la app (se podría usar `expo-secure-store` / `AsyncStorage`).
- **Dependencias sin uso**: `expo-router` (la navegación real es React Navigation), `react-native-sound`, `expo-av` y `tailwind.config.js` (no hay NativeWind instalado). Se pueden eliminar para reducir el bundle.
- **Duplicación de capas HTTP**: `api/*` (axios) y `src/services/http.ts` (fetch) hacen lo mismo; consolidar en una sola.
- **`react-query` configurado pero sin uso**: el estado remoto se maneja con `useState`/`useEffect`, lo que genera cargas repetidas.
- **Sin manejo de estado de error visible** en varias pantallas (solo `console.error`).
- **Sin tests**: no hay pruebas unitarias ni de componentes.

---

## 👥 Autores

Proyecto académico del curso **Soluciones Móviles** (Universidad Católica del Norte), desarrollado en equipo:

- **Diego Cortés** — [@DiegoCortes07](https://github.com/DiegoCortes07)
- **Cristian Jiménez** — [@CrisPalaUnion](https://github.com/CrisPalaUnion)
