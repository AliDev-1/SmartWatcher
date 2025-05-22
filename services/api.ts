// Movie Types
interface Movie {
  id: number;
  poster_path: string;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  backdrop_path: string;
  media_type?: string;
  popularity: number;
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
}

interface MovieCredits {
  id: number;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

interface MovieVideos {
  id: number;
  results: MovieVideo[];
}

interface MovieWatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      rent?: {
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }[];
      buy?: {
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }[];
      flatrate?: {
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }[];
    };
  };
}

interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

interface ReviewsResponse {
  id: number;
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

// TV Show Types
interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
}

interface TVShowDetails {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  vote_average: number;
  vote_count: number;
  status: string;
  genres: { id: number; name: string }[];
  created_by: { id: number; name: string }[];
  networks: { id: number; name: string }[];
  episode_run_time: number[];
}

// TV Season and Episode Types
interface TVSeason {
  id: number;
  air_date: string;
  episodes: TVEpisode[];
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
  guest_stars: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

// Person Types
interface PersonDetails {
  id: number;
  name: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number;
  biography: string;
  profile_path: string | null;
  homepage: string | null;
  also_known_as: string[];
  known_for_department: string;
  popularity: number;
}

interface PersonMovieCredits {
  id: number;
  cast: {
    id: number;
    title: string;
    original_title: string;
    character: string;
    release_date: string;
    poster_path: string | null;
    popularity: number;
    vote_count: number;
    vote_average: number;
    genre_ids: number[];
    overview: string;
  }[];
  crew: {
    id: number;
    title: string;
    original_title: string;
    job: string;
    department: string;
    release_date: string;
    poster_path: string | null;
    popularity: number;
    vote_count: number;
    vote_average: number;
    genre_ids: number[];
    overview: string;
  }[];
}

interface PersonTVCredits {
  id: number;
  cast: {
    id: number;
    name: string;
    original_name: string;
    character: string;
    first_air_date: string;
    poster_path: string | null;
    popularity: number;
    vote_count: number;
    vote_average: number;
    genre_ids: number[];
    overview: string;
  }[];
  crew: {
    id: number;
    name: string;
    original_name: string;
    job: string;
    department: string;
    first_air_date: string;
    poster_path: string | null;
    popularity: number;
    vote_count: number;
    vote_average: number;
    genre_ids: number[];
    overview: string;
  }[];
}

interface PersonImages {
  id: number;
  profiles: {
    aspect_ratio: number;
    height: number;
    width: number;
    file_path: string;
    vote_average: number;
    vote_count: number;
  }[];
}

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}): Promise<{ results: Movie[]; total_pages: number }> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(
        query
      )}&page=${page}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    results: data.results,
    total_pages: data.total_pages,
  };
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchMovieCredits = async (
  movieId: string
): Promise<MovieCredits> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie credits: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    throw error;
  }
};

export const fetchMovieVideos = async (
  movieId: string
): Promise<MovieVideos> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie videos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    throw error;
  }
};

export const fetchMovieWatchProviders = async (
  movieId: string
): Promise<MovieWatchProviders> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch watch providers: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie watch providers:", error);
    throw error;
  }
};

export const fetchMovieReviews = async (
  movieId: string
): Promise<ReviewsResponse> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/reviews`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie reviews: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    throw error;
  }
};

export const fetchNowPlayingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/now_playing`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch now playing movies: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    throw error;
  }
};

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/upcoming`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch upcoming movies: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    throw error;
  }
};

// TV Shows API Functions
export const fetchTVShows = async ({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}): Promise<{ results: TVShow[]; total_pages: number }> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(
        query
      )}&page=${page}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc&page=${page}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TV shows: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    results: data.results,
    total_pages: data.total_pages,
  };
};

export const fetchTVShowDetails = async (
  tvId: string
): Promise<TVShowDetails> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TV show details: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    throw error;
  }
};

export const fetchAiringTodayTVShows = async (): Promise<TVShow[]> => {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Use discover endpoint with specific filters for US and CA shows
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/tv?air_date.gte=${formattedDate}&air_date.lte=${formattedDate}&watch_region=US&with_origin_country=US|CA&sort_by=popularity.desc`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch airing today TV shows: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching airing today TV shows:", error);
    throw error;
  }
};

export const fetchPopularTVShows = async (): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/tv?include_adult=false&language=en-US&watch_region=US&with_origin_country=US%7CCA&page=1&sort_by=vote_average.desc&vote_count.gte=200`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch top rated TV shows: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching top rated TV shows:", error);
    throw error;
  }
};

export const fetchTVShowWatchProviders = async (
  tvId: string
): Promise<MovieWatchProviders> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TV watch providers: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV watch providers:", error);
    throw error;
  }
};

export const fetchTVShowVideos = async (tvId: string): Promise<MovieVideos> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/videos`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TV videos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV videos:", error);
    throw error;
  }
};

export const fetchTVShowReviews = async (
  tvId: string
): Promise<ReviewsResponse> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/reviews`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TV reviews: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV reviews:", error);
    throw error;
  }
};

export const fetchTVShowCredits = async (
  tvId: string
): Promise<MovieCredits> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/credits`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TV credits: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV credits:", error);
    throw error;
  }
};

// Person API Functions
export const fetchPersonDetails = async (
  personId: string
): Promise<PersonDetails> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${personId}`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch person details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching person details:", error);
    throw error;
  }
};

export const fetchPersonMovieCredits = async (
  personId: string
): Promise<PersonMovieCredits> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/movie_credits`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch person movie credits: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching person movie credits:", error);
    throw error;
  }
};

export const fetchPersonTVCredits = async (
  personId: string
): Promise<PersonTVCredits> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/tv_credits`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch person TV credits: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching person TV credits:", error);
    throw error;
  }
};

export const fetchPersonImages = async (
  personId: string
): Promise<PersonImages> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/person/${personId}/images`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch person images: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching person images:", error);
    throw error;
  }
};

export const fetchMostPopularTVShows = async (): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/tv?include_adult=false&language=en-US&watch_region=US&with_origin_country=US|CA&page=1&sort_by=popularity.desc`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch most popular TV shows: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching most popular TV shows:", error);
    throw error;
  }
};

export const fetchTVShowSeasons = async (
  tvId: string
): Promise<{
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date: string | null;
    overview: string;
  }[];
}> => {
  try {
    // We can get the seasons from the TV show details endpoint
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TV seasons: ${response.statusText}`);
    }

    const data = await response.json();
    return { seasons: data.seasons };
  } catch (error) {
    console.error("Error fetching TV seasons:", error);
    throw error;
  }
};

export const fetchTVSeasonDetails = async (
  tvId: string,
  seasonNumber: number
): Promise<TVSeason> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TV season details: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV season details:", error);
    throw error;
  }
};

export const fetchTVEpisodeDetails = async (
  tvId: string,
  seasonNumber: number,
  episodeNumber: number
): Promise<TVEpisode> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TV episode details: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV episode details:", error);
    throw error;
  }
};

export const fetchMovieRecommendations = async (
  movieId: string
): Promise<{ results: Movie[] }> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/recommendations`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch movie recommendations: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    throw error;
  }
};
