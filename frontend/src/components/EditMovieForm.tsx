import { useState } from 'react';
import { MovieTitle } from '../types/MovieTitle';
import { updateMovie } from '../api/MoviesAPI';
import GenreChecklist from './GenreChecklist';

const EditMovieForm = ({
  movie,
  onSuccess,
  onCancel,
}: {
  movie: MovieTitle;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [type, setType] = useState(movie.type);
  const [title, setTitle] = useState(movie.title);
  const [director, setDirector] = useState(movie.director || '');
  const [cast, setCast] = useState(movie.cast || '');
  const [country, setCountry] = useState(movie.country || '');
  const [releaseYear, setReleaseYear] = useState(movie.releaseYear.toString());
  const [rating, setRating] = useState(movie.rating);
  const [duration, setDuration] = useState(movie.duration || '');
  const [description, setDescription] = useState(movie.description || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(movie.genres || []);
  const [errors, setErrors] = useState<{ title?: string; releaseYear?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!title.trim()) {
      errs.title = 'Title is required.';
    }
    if (
      releaseYear.length !== 4 ||
      isNaN(+releaseYear) ||
      +releaseYear < 1900 ||
      +releaseYear > 2100
    ) {
      errs.releaseYear = 'Enter a valid 4-digit year between 1900–2100.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: MovieTitle = {
      ...movie,
      type,
      title,
      director,
      cast,
      country,
      releaseYear: parseInt(releaseYear),
      rating,
      duration,
      description,
      genres: selectedGenres,
    };

    await updateMovie(movie.showId, updated);
    onSuccess();
  };

  const renderField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    type: string = 'text',
    props: any = {}
  ) => (
    <div className="row mb-2 align-items-center">
      <label className="col-sm-3 col-form-label">{label}</label>
      <div className="col-sm-9">
        <input
          type={type}
          className="form-control"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row mb-2 align-items-center">
        <label className="col-sm-3 col-form-label">Type</label>
        <div className="col-sm-9">
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Movie">Movie</option>
            <option value="TV Show">TV Show</option>
          </select>
        </div>
      </div>

      <div className="row mb-2 align-items-start">
        <label className="col-sm-3 col-form-label">Title</label>
        <div className="col-sm-9">
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>
      </div>

      {renderField('Director', director, setDirector)}
      {renderField('Cast', cast, setCast)}
      {renderField('Country', country, setCountry)}

      <div className="row mb-2 align-items-start">
        <label className="col-sm-3 col-form-label">Release Year</label>
        <div className="col-sm-9">
          <input
            type="text"
            className={`form-control ${errors.releaseYear ? 'is-invalid' : ''}`}
            value={releaseYear}
            maxLength={4}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{0,4}$/.test(val)) {
                setReleaseYear(val);
                if (errors.releaseYear)
                  setErrors((prev) => ({ ...prev, releaseYear: undefined }));
              }
            }}
            placeholder="e.g. 2023"
          />
          {errors.releaseYear && (
            <div className="invalid-feedback">{errors.releaseYear}</div>
          )}
        </div>
      </div>

      {renderField('Rating', rating, setRating)}
      {renderField('Duration', duration, setDuration)}

      <div className="row mb-2 align-items-start">
        <label className="col-sm-3 col-form-label">Description</label>
        <div className="col-sm-9">
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <GenreChecklist selected={selectedGenres} setSelected={setSelectedGenres} />

      <div className="d-flex justify-content-start mt-3">
        <button className="btn btn-primary me-2" type="submit">
          Update
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditMovieForm;
