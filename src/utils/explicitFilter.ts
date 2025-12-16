import User from "../interfaces/User";
import Song from "../interfaces/Song";

export const filterExplicitSongs = (songs: Song[] = [], user?: User | null) => {
  const explicitDisabled = !!user && user.explicitContent === false;
  return explicitDisabled ? songs.filter((s) => !s.explicit) : songs;
};
