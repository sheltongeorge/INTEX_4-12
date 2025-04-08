import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react"; // npm install lucide-react

type Movie = {
  showId: string;
  title: string;
  rating: string;
  description: string;
};

export const MovieCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 5, spacing: 16 },
    breakpoints: {
      "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
      "(max-width: 768px)": { slides: { perView: 2, spacing: 10 } },
    },
  });

  useEffect(() => {
    fetch("https://localhost:7156/api/moviestitles", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMovies(data.slice(0, 30)))
      .catch((err) => console.error("❌ Error loading movies:", err));
  }, []);

  return (
    <div className="relative w-full max-w-screen-xl mx-auto py-8">
      {/* Slider container */}
      <div ref={sliderRef} className="keen-slider">
        {movies.map((movie) => (
          <div key={movie.showId} className="keen-slider__slide px-2">
            <div className="relative w-full aspect-[2/3] bg-black rounded-xl overflow-hidden shadow-lg group flex items-center justify-center">
              <img
                src={`https://localhost:7156/MoviePosters/${encodeURIComponent(
                  movie.title
                )}.jpg`}
                alt={movie.title}
                className="w-full h-full object-contain max-w-full max-h-full transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/fallback.jpg";
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-bold truncate">{movie.title}</h3>
                <p>Rating: {movie.rating}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-200 z-10"
        aria-label="Previous"
      >
        <ArrowLeft size={20} />
      </button>
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-200 z-10"
        aria-label="Next"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
