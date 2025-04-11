import { useState } from 'react';
import { MovieTitle } from '../types/MovieTitle';
import { addMovie } from '../api/MoviesAPI';
import GenreChecklist from './GenreChecklist';

const NewMovieForm = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [type, setType] = useState('Movie');
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [country, setCountry] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [rating, setRating] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [errors, setErrors] = useState<{
    title?: string;
    releaseYear?: string;
  }>({});

  const generateShowId = () => `s${Date.now()}`;

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

    const newMovie: Partial<MovieTitle> = {
      showId: generateShowId(),
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

    await addMovie(newMovie);
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
      <label className="col-sm-3 col-form-label text-white">{label}</label>
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
        <label className="col-sm-3 col-form-label text-white">Type</label>
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
        <label className="col-sm-3 col-form-label text-white">Title</label>
        <div className="col-sm-9">
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>
      </div>

      {renderField('Director', director, setDirector)}
      {renderField('Cast', cast, setCast)}
      {renderField('Country', country, setCountry)}

      <div className="row mb-2 align-items-start">
        <label className="col-sm-3 col-form-label text-white">
          Release Year
        </label>
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
        <label className="col-sm-3 col-form-label text-white">
          Description
        </label>
        <div className="col-sm-9">
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <GenreChecklist
        selected={selectedGenres}
        setSelected={setSelectedGenres}
      />

      <div className="d-flex justify-content-start mt-3">
        <button className="btn btn-success me-2" type="submit">
          Save
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NewMovieForm;
