import { MovieTitle } from '../types/MovieTitle';

interface FetchMoviesResponse {
  movies: MovieTitle[];
  totalCount: number;
}

const API_URL = 'https://localhost:7156/api/MoviesTitles';

// These are the JSON keys coming FROM the backend (camelCase)
// But also map to the correct display names
const genreFields = [
  { apiKey: 'action', label: 'Action' },
  { apiKey: 'adventure', label: 'Adventure' },
  {
    apiKey: 'animeSeriesInternationalTVShows',
    label: 'Anime Series International TV Shows',
  },
  {
    apiKey: 'britishTVShowsDocuseriesInternationalTVShows',
    label: 'British TV Shows Docuseries International TV Shows',
  },
  { apiKey: 'children', label: 'Children' },
  { apiKey: 'comedies', label: 'Comedies' },
  {
    apiKey: 'comediesDramasInternationalMovies',
    label: 'Comedies Dramas International Movies',
  },
  {
    apiKey: 'comediesInternationalMovies',
    label: 'Comedies International Movies',
  },
  { apiKey: 'comediesRomanticMovies', label: 'Comedies Romantic Movies' },
  { apiKey: 'crimeTVShowsDocuseries', label: 'Crime TV Shows Docuseries' },
  { apiKey: 'documentaries', label: 'Documentaries' },
  {
    apiKey: 'documentariesInternationalMovies',
    label: 'Documentaries International Movies',
  },
  { apiKey: 'docuseries', label: 'Docuseries' },
  { apiKey: 'dramas', label: 'Dramas' },
  { apiKey: 'dramasInternationalMovies', label: 'Dramas International Movies' },
  { apiKey: 'dramasRomanticMovies', label: 'Dramas Romantic Movies' },
  { apiKey: 'familyMovies', label: 'Family Movies' },
  { apiKey: 'fantasy', label: 'Fantasy' },
  { apiKey: 'horrorMovies', label: 'Horror Movies' },
  {
    apiKey: 'internationalMoviesThrillers',
    label: 'International Movies Thrillers',
  },
  {
    apiKey: 'internationalTVShowsRomanticTVDramas',
    label: 'International TV Shows Romantic TV Shows TV Dramas',
  },
  { apiKey: 'kidsTV', label: "Kids' TV" },
  { apiKey: 'languageTVShows', label: 'Language TV Shows' },
  { apiKey: 'musicals', label: 'Musicals' },
  { apiKey: 'natureTV', label: 'Nature TV' },
  { apiKey: 'realityTV', label: 'Reality TV' },
  { apiKey: 'spirituality', label: 'Spirituality' },
  { apiKey: 'tvAction', label: 'TV Action' },
  { apiKey: 'tvComedies', label: 'TV Comedies' },
  { apiKey: 'tvDramas', label: 'TV Dramas' },
];

export const fetchMovies = async (
  pageSize: number,
  pageNum: number,
  titleFilter?: string
): Promise<FetchMoviesResponse> => {
  try {
    const url = new URL(`${API_URL}/AllMovies`);
    url.searchParams.set('pageSize', pageSize.toString());
    url.searchParams.set('pageNum', pageNum.toString());
    if (titleFilter) {
      url.searchParams.set('titleFilter', titleFilter);
    }

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch movies');

    const data = await response.json();

    const movies: MovieTitle[] = data.movies.map((m: any) => ({
      ...m,
      genres: genreFields.filter((g) => m[g.apiKey] === 1).map((g) => g.label),
    }));

    return {
      movies,
      totalCount: data.totalCount,
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const addMovie = async (
  newMovie: Partial<MovieTitle>
): Promise<MovieTitle> => {
  const body = mapMovieToApiFormat(newMovie);
  const response = await fetch(`${API_URL}/AddMovie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Failed to add movie');
  const m = await response.json();
  return {
    ...m,
    genres: genreFields.filter((g) => m[g.apiKey] === 1).map((g) => g.label),
  };
};

export const updateMovie = async (
  id: string,
  updatedMovie: Partial<MovieTitle>
): Promise<MovieTitle> => {
  const body = mapMovieToApiFormat(updatedMovie);
  const response = await fetch(`${API_URL}/UpdateMovie/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Failed to update movie');
  const m = await response.json();
  return {
    ...m,
    genres: genreFields.filter((g) => m[g.apiKey] === 1).map((g) => g.label),
  };
};

export const deleteMovie = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/DeleteMovie/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete movie');
};

function mapMovieToApiFormat(movie: Partial<MovieTitle>): any {
  const mapped: any = {
    ...movie,
  };

  genreFields.forEach((g) => {
    mapped[g.apiKey] = movie.genres?.includes(g.label) ? 1 : 0;
  });

  return mapped;
}
