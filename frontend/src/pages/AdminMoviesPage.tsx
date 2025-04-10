import { useEffect, useState, useContext } from 'react';
import { MovieTitle } from '../types/MovieTitle';
import { deleteMovie, fetchMovies } from '../api/MoviesAPI';
import Pagination from '../components/Pagination';
import NewMovieForm from '../components/NewMovieForm';
import EditMovieForm from '../components/EditMovieForm';
import AuthorizeView, {
  AuthorizedUser,
  UserContext,
} from '../components/AuthorizeView';
import Logout from '../components/Logout';

const AdminMoviesPageContent = () => {
  const user = useContext(UserContext);

  // if (!user?.roles.includes('Administrator')) {
  //   return <Navigate to="/login" />;
  // }
  if (!user) {
    // User is not yet loaded (AuthorizeView will redirect if unauthorized)
    return null;
  }
  
  if (!user.roles.includes('Administrator')) {
    // User is logged in, but not an admin
    return <p className="text-danger">Access Denied: Admins only.</p>;
  }

  const [movies, setMovies] = useState<MovieTitle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieTitle | null>(null);
  const [searchTitle, setSearchTitle] = useState('');

  const loadMovies = async () => {
    try {
      const data = await fetchMovies(pageSize, pageNum, searchTitle);
      setMovies(data.movies);
      setTotalPages(Math.ceil(data.totalCount / pageSize));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, [pageSize, pageNum, searchTitle]);

  const handleDelete = async (showId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this movie?'
    );
    if (!confirmDelete) return;

    try {
      await deleteMovie(showId);
      setMovies(movies.filter((m) => m.showId !== showId));
    } catch (error) {
      alert('Failed to delete movie. Please try again.');
    }
  };

  return (
    <>
      <span>
        <Logout>
          Logout <AuthorizedUser value="email" />
        </Logout>
      </span>

      <div style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        <h1 style={{ color: 'white' }}>Admin - Movies</h1>

        <div className="mb-3 d-flex justify-content-between">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setPageNum(1);
            }}
          />
        </div>

        {!showForm && (
          <button
            className="btn btn-success mb-3"
            onClick={() => setShowForm(true)}
          >
            Add Movie
          </button>
        )}

        {showForm && (
          <NewMovieForm
            onSuccess={() => {
              setShowForm(false);
              loadMovies();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingMovie && (
          <EditMovieForm
            movie={editingMovie}
            onSuccess={() => {
              setEditingMovie(null);
              loadMovies();
            }}
            onCancel={() => setEditingMovie(null)}
          />
        )}

        {loading ? (
          <p>Loading movies...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Director</th>
                  <th style={{ width: '60%' }}>Cast</th>
                  <th>Country</th>
                  <th>Release Year</th>
                  <th>Rating</th>
                  <th>Duration</th>
                  <th style={{ width: '60%' }}>Description</th>
                  <th style={{ width: '2%' }}>Genres</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m.showId}>
                    <td>{m.type}</td>
                    <td>{m.title}</td>
                    <td>{m.director}</td>
                    <td style={{ width: '20%' }}>{m.cast}</td>
                    <td>{m.country}</td>
                    <td>{m.releaseYear}</td>
                    <td>{m.rating}</td>
                    <td>{m.duration}</td>
                    <td style={{ width: '20%' }}>{m.description}</td>
                    <td style={{ width: '5%' }}>{m.genres?.join(', ')}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm w-100 mb-1"
                        onClick={() => setEditingMovie(m)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm w-100"
                        onClick={() => handleDelete(m.showId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={pageNum}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPageNum}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPageNum(1);
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

// ✅ Only wrap the actual content in AuthorizeView
const AdminMoviesPage = () => (
  <AuthorizeView>
    <AdminMoviesPageContent />
  </AuthorizeView>
);

export default AdminMoviesPage;
