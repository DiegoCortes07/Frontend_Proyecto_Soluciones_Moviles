import User from "./User";
import Song from "./Song";
import Album from "./Album";
export default interface Props {
  user:User;
  songs: Song[];
  filteredSongs: Song[];
  loadingSongs: boolean;
  albums: Album[];
  filteredAlbums: Album[];
  loadingAlbums: boolean;
  searchText: string;
  setSearchText: (s: string) => void;
  onSongSelect: (s: Song) => void;
  barHeight: number;
}
