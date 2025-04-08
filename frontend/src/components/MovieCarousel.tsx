import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "./MovieCarousel.css";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
      .catch((err) => console.error("Error loading movies:", err));
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div ref={sliderRef} className="keen-slider">
          {movies.map((movie) => (
            <div key={movie.showId} className="keen-slider__slide slide">
              <div className="poster-card">
                <div className="poster-image-container">
                  <img
                    src={`https://localhost:7156/MoviePosters/${encodeURIComponent(
                      movie.title
                    )}.jpg`}
                    alt={movie.title}
                    className="poster-image"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback.jpg";
                    }}
                  />
                </div>
                <div className="hover-info">
                  <h3 className="poster-title">{movie.title}</h3>
                  <p className="poster-rating">Rating: {movie.rating}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="arrow left-arrow"
          onClick={() => instanceRef.current?.prev()}
        >
          <ArrowLeft size={20} />
        </button>

        <button
          className="arrow right-arrow"
          onClick={() => instanceRef.current?.next()}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
