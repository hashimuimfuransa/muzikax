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
  paymentType?: 'free' | 'paid';
  price?: number;
  currency?: string;
  plays: number;
  likes: number;
  comments: string[];
  createdAt: string;
  updatedAt: string;
  location?: string; // Added for location-based recommendations
  duration?: string; // Added for track duration
  albumId?: string | { _id: string; title: string }; // Added for album context
  albumTitle?: string; // Added for album context
  creatorWhatsapp?: string; // Added for creator contact
}