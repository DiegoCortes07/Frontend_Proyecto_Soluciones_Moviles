export default interface Song {
  id: number;
  title: string;
  year?: number;
  artistName: string;
  imageUrl: string;
  cloudinarySecureUrl: string;
  artistId?: number;
  albumId?: number;
  explicit?: boolean;
  isPodcast? : boolean;
  duration?: number;
}
