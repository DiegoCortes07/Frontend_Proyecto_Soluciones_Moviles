export default interface Song {
  id: number;
  title: string;
  artistName: string;
  imageUrl: string;
  cloudinarySecureUrl: string;
  artistId?: number;
  albumId?: number;
}
