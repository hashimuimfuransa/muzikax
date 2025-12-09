export interface ITrack {
  _id: string;
  creatorId: string;
  creatorType: 'artist' | 'dj' | 'producer';
  title: string;
  description: string;
  audioURL: string;
  coverURL: string;
  genre: string;
  type: 'song' | 'beat' | 'mix';
  plays: number;
  likes: number;
  comments: string[];
  createdAt: string;
  updatedAt: string;
}