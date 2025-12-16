export default interface Podcast {
  id: number;
  title: string;
  artistId?: number;
  artistName?: string;
  genre?: string;
  year?: number;
  image?: string;
  imageUrl?: string;
  description?: string;
}
