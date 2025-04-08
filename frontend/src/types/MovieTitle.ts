export interface MovieTitle {
    showId: string;
    type: string;
    title: string;
    director: string;
    cast: string;
    country: string;
    releaseYear: number;
    rating: string;
    duration: string;
    description: string;
    posterUrl?: string;
    genres: string[]; // derived from the genre columns
  }
  