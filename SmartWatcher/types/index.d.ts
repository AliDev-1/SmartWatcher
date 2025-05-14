interface Movie {
  id: number;
  title: string;
  poster_path: string;
  [key: string]: any;
}

interface TrendingMovie {
  movie_id: number;
  title: string;
  poster_url: string;
  searchTerm: string;
  count: number;
  [key: string]: any;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}
