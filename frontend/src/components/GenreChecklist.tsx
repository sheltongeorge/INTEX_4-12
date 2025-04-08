const allGenres = [
  "Action", "Adventure", "Anime Series International TV Shows", "British TV Shows Docuseries International TV Shows",
  "Children", "Comedies", "Comedies Dramas International Movies", "Comedies International Movies",
  "Comedies Romantic Movies", "Crime TV Shows Docuseries", "Documentaries", "Documentaries International Movies",
  "Docuseries", "Dramas", "Dramas International Movies", "Dramas Romantic Movies", "Family Movies", "Fantasy",
  "Horror Movies", "International Movies Thrillers", "International TV Shows Romantic TV Shows TV Dramas", "Kids' TV",
  "Language TV Shows", "Musicals", "Nature TV", "Reality TV", "Spirituality", "TV Action", "TV Comedies", "TV Dramas"
];

const GenreChecklist = ({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (genres: string[]) => void;
}) => {
  const toggleGenre = (genre: string) => {
    setSelected(
      selected.includes(genre)
        ? selected.filter((g) => g !== genre)
        : [...selected, genre]
    );
  };

  return (
    <div className="row mb-3">
      <label className="col-sm-3 col-form-label" style={{ color: 'white' }}>Genres</label>
      <div className="col-sm-9">
        <div className="d-flex flex-wrap">
          {allGenres.map((genre) => (
            <div className="form-check me-3" key={genre}>
              <input
                className="form-check-input"
                type="checkbox"
                checked={selected.includes(genre)}
                onChange={() => toggleGenre(genre)}
                id={genre}
              />
              <label className="form-check-label" htmlFor={genre}>
                {genre}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreChecklist;
