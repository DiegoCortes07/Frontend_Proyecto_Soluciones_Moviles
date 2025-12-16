/**
 * Utility functions for handling image URLs and fallbacks
 */
import { API_URL } from "../services/env";

// Default placeholder image (generic music icon)
export const DEFAULT_SONG_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
export const DEFAULT_PLAYLIST_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/11065/11065753.png";

/**
 * Normalizes a potentially local/relative URL to the API host so it works on device.
 */
const normalizeToApiHost = (url: string | null | undefined): string | null => {
  if (!url) return null;

  const apiBase = API_URL?.replace(/\/$/, "");
  if (!apiBase) return url;

  try {
    const api = new URL(apiBase);

    // Relative path
    if (url.startsWith("/")) {
      return `${api.origin}${url}`;
    }

    const current = new URL(url);
    const host = current.hostname;

    // Replace localhost/127.* with API host for mobile/expo
    if (host === "localhost" || host.startsWith("127.")) {
      current.protocol = api.protocol;
      current.hostname = api.hostname;
      current.port = api.port;
      return current.toString();
    }

    return url;
  } catch {
    // If URL constructor fails, fall back to joining with apiBase
    if (url.startsWith("/")) return `${apiBase}${url}`;
    return url;
  }
};

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;
  try {
    const urlObj = new URL(url);
    return /^https?:/.test(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Gets a valid image URL with fallback
 */
export const getImageUrl = (
  primaryUrl: string | null | undefined,
  fallbackUrl: string = DEFAULT_SONG_IMAGE
): string => {
  const normalized = normalizeToApiHost(primaryUrl ?? null);
  if (isValidImageUrl(normalized)) {
    return normalized!;
  }
  return fallbackUrl;
};

/**
 * Gets playlist image URL with fallback
 */
export const getPlaylistImageUrl = (
  imageUrl: string | null | undefined
): string => {
  return getImageUrl(imageUrl, DEFAULT_PLAYLIST_IMAGE);
};

/**
 * Gets song image URL with fallback
 */
export const getSongImageUrl = (
  imageUrl: string | null | undefined
): string => {
  return getImageUrl(imageUrl, DEFAULT_SONG_IMAGE);
};

/**
 * Logs image loading errors with details
 */
export const logImageError = (
  context: string,
  imageUrl: string | null | undefined,
  error?: any
): void => {
  console.warn(
    `[ImageError] ${context}: Failed to load image`,
    {
      url: imageUrl,
      error: error?.message || error,
    }
  );
};
