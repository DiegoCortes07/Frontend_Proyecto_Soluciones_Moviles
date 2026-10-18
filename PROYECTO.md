# 📦 Proyecto Soluciones Móviles — Visión general

Documento de contexto del proyecto completo. Para el detalle técnico de cada parte, ver:

- 📱 [README del **Frontend**](./README.md)
- 🖥 README del **Backend** → repositorio [`DiegoCortes07/Backend_Proyecto_Soluciones_Moviles`](https://github.com/DiegoCortes07/Backend_Proyecto_Soluciones_Moviles) *(privado)*

---

## 🎯 ¿De qué trata?

**Tunesly** es un **clon de Spotify** compuesto por dos aplicaciones que trabajan juntas:

| | Repositorio | Rol |
| --- | --- | --- |
| 📱 | `Frontend_Proyecto_Soluciones_Moviles` | App móvil/multiplataforma (React Native + Expo) que el usuario instala y usa |
| 🖥 | `Backend_Proyecto_Soluciones_Moviles` | API REST (Node + Express + Sequelize) que sirve el catálogo, la autenticación y los datos del usuario |

La app reproduce **audio real** (canciones y episodios de podcast) almacenado en Cloudinary, y persiste usuarios, favoritos, playlists y preferencias en una base de datos SQLite a través de la API.

Es un proyecto **académico** del curso *Soluciones Móviles* (Universidad Católica del Norte), desarrollado por un equipo de dos personas.

---

## ✨ Qué hace la aplicación

| Módulo | Descripción |
| --- | --- |
| 🔐 **Autenticación** | Registro, login con **JWT** y verificación de correo por email |
| 🏠 **Inicio** | Catálogo de canciones, álbumes y podcasts con **búsqueda** y **filtro por género** |
| ▶️ **Reproductor** | Cola de reproducción, play/pausa, anterior/siguiente, barra de progreso, avance automático y mini-reproductor persistente |
| ❤️ **Favoritos** | "Me gusta" por usuario con actualización optimista en la interfaz |
| 📂 **Playlists** | Crear, renombrar, describir, subir portada y agregar/quitar canciones |
| 🎙 **Podcasts** | Listado de shows y reproducción de episodios |
| 👤 **Perfil** | Cambio de nombre, correo, foto y contraseña |
| ⚙️ **Ajustes** | Tema claro/oscuro, idioma, filtro de **contenido explícito** y **plan** de suscripción |

---

## 🧱 Arquitectura

```
┌──────────────────────────────┐        HTTPS/JSON        ┌────────────────────────────────┐
│  App móvil (Expo / RN)       │  ───────────────────────▶ │  API REST (Express)            │
│  · React Navigation (stack)  │   Bearer JWT en headers   │  · routes → controllers        │
│  · Contextos: Auth, Player,  │  ◀─────────────────────── │  · models (Sequelize)          │
│    Theme                     │        JSON               │  · JWT + bcrypt                │
│  · capa api/ (axios)         │                           │                                │
└──────────────────────────────┘                           └────────────┬───────────────────┘
                                                                        │
                                                       ┌────────────────┴────────────────┐
                                                       │  SQLite (Sequelize)             │
                                                       │  Cloudinary (audio e imágenes)  │
                                                       │  Gmail SMTP (verificación)      │
                                                       └─────────────────────────────────┘
```

---

## 🗂 Modelo de datos (resumen)

```
user ──< playlist ──< PlaylistSong >── song >── album >── artist
  └──< like >── song
```

- `song` almacena **canciones y episodios de podcast** (campo `isPodcast`).
- `album` almacena **álbumes y shows de podcast** (campo `isPodcast`).
- `like.enabled` permite quitar un favorito sin borrar el registro.

Detalle completo en el README del backend (incluye el diagrama relacional).

---

## 🚀 Puesta en marcha rápida

### 1. Backend

```bash
git clone https://github.com/DiegoCortes07/Backend_Proyecto_Soluciones_Moviles.git
cd Backend_Proyecto_Soluciones_Moviles
npm install
cp .env.example .env      # completar JWT_SECRET, credenciales de Cloudinary y de correo
npm run dev               # API en http://localhost:8080/api
```

### 2. Frontend

```bash
git clone https://github.com/DiegoCortes07/Frontend_Proyecto_Soluciones_Moviles.git
cd Frontend_Proyecto_Soluciones_Moviles
npm install
# apuntar la URL de la API a tu backend (ver README del frontend: 3 archivos)
npm start
```

> El backend ya incluye **seeders** con artistas, álbumes, canciones y podcasts de ejemplo, y usuarios de prueba (`diego@test.com` / `password123`), así que la app tiene contenido desde el primer arranque.

---

## 🧰 Tecnologías utilizadas

| Capa | Tecnologías |
| --- | --- |
| Frontend | Expo SDK 54, React Native 0.81, React 19, TypeScript, React Navigation 7, expo-audio, axios, TanStack Query |
| Backend | Node.js (ESM), Express 5, Sequelize 6, SQLite, JWT, bcrypt, multer / express-fileupload, Nodemailer |
| Servicios | Cloudinary (media), Gmail SMTP (correo) |

---

## 👥 Equipo

- **Diego Cortés** — [@DiegoCortes07](https://github.com/DiegoCortes07)
- **Cristian Jiménez** — [@CrisPalaUnion](https://github.com/CrisPalaUnion)

Proyecto académico desarrollado en equipo; ambos integrantes participaron en el diseño, la implementación y las pruebas de la solución.
