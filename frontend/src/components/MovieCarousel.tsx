import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";

type Movie = {
  showId: string;
  title: string;
  posterUrl: string;
  rating: string;
  description: string;
};

export const MovieCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: {
      perView: 5,
      spacing: 15,
    },
  });

  useEffect(() => {
    fetch("https://localhost:7156/api/moviestitles", {
      credentials: "include", // 👈 Needed if using Identity auth (cookies)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then((data) => setMovies(data))
      .catch((err) => console.error("❌ Error loading movies:", err));
  }, []);

  return (
    <div ref={ref} className="keen-slider p-4">
      {movies.map((movie) => (
        <div
          key={movie.showId}
          className="keen-slider__slide relative group cursor-pointer"
        >
          <img
            src={`https://localhost:7156${movie.posterUrl}`}
            alt={movie.title}
            className="w-full h-[300px] object-cover rounded-xl shadow-md"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 rounded-xl">
            <h3 className="text-white text-lg font-bold">{movie.title}</h3>
            <p className="text-white text-sm">Rating: {movie.rating}</p>
            <p className="text-white text-xs line-clamp-3">
              {movie.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
