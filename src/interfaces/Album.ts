export default interface Album {
  id: number;
  title: string;
  image: string;
  artistName: string;
  artistId: number;
  genre: string;
  year : number;
  isPodcast? : boolean;
}