import { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function MovieSearchModal({ isOpen, onClose, onAddWatchedMovie }) {
  const [movies, setMovies] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMovie(null);
      setSearchTerm('');
      setReview('');
      setRating('5');
      
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/api/movies`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error fetching movies from the server.');
          }
          return response.json();
        })
        .then((data) => {
          setMovies(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching movies:', err);
          setError('Failed to fetch movies from the server.');
          setLoading(false);
        });
    }
  }, [isOpen]);


  const filteredMovies = movies.filter((movie) =>
    movie.title ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const newWatched = {
      id: Date.now(),
      movieId: selectedMovie._id || selectedMovie.id,
      title: selectedMovie.title,
      poster_url: selectedMovie.poster_url,
      rating: Number(rating),
      review: review,
      watchedAt: new Date().toLocaleDateString()
    };

    if (onAddWatchedMovie) {
      onAddWatchedMovie(newWatched);
    }

    setToastMessage(`"${selectedMovie.title}" added to your reviews!`);

    if (onClose) onClose();

    setTimeout(() => {
      setToastMessage('');
      setSelectedMovie(null);
      setReview('');
      setRating('5');
    }, 2500);
  };

  return (
    <>      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>

            {!selectedMovie ? (
              <>
                <h3 style={styles.title}>Search for a Movie</h3>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Movie title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                  />
                </div>

                {loading && <p style={{ textAlign: 'center', color: '#aaa' }}>Fetching movies...</p>}
                {error && <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>}

                {!loading && !error && (
                  <div style={styles.grid}>
                    {filteredMovies.length > 0 ? (
                      filteredMovies.map((movie) => (
                        <div 
                          key={movie._id || movie.id} 
                          style={styles.card}
                          onClick={() => setSelectedMovie(movie)}
                        >
                          {movie.poster_url ? (
                            <img 
                              src={movie.poster_url} 
                              alt={movie.title} 
                              style={styles.posterImage} 
                            />
                          ) : (
                            <div style={styles.posterPlaceholder}>
                              <span>Poster Box</span>
                            </div>
                          )}
                          
                          <p style={styles.movieTitle}>{movie.title}</p>
                          
                          {(movie.year || movie.release_year) && (
                            <p style={styles.movieSubText}>Year: {movie.year || movie.release_year}</p>
                          )}
                          {movie.genre && (
                            <p style={styles.movieSubText}>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa' }}>
                        No movies found.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <h3 style={styles.title}>Rate Movie: {selectedMovie.title}</h3>
                <form onSubmit={handleLogSubmit} style={styles.form}>
                  <div style={styles.field}>
                    <label>Rating (1 - 5):</label>
                    <select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value)}
                      style={styles.input}
                    >
                      <option value="1">⭐ 1 - Very Bad</option>
                      <option value="2">⭐⭐ 2 - Bad</option>
                      <option value="3">⭐⭐⭐ 3 - Average</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Masterpiece</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label>Review (optional):</label>
                    <textarea
                      placeholder="Write your thoughts.."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      style={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <div style={styles.btnGroup}>
                    <button type="submit" style={styles.saveBtn}>Save Movie</button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedMovie(null)} 
                      style={styles.cancelBtn}
                    >
                      Back to Search
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={styles.toast}>
          ✓ {toastMessage}
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(61, 31, 29, 0.25)',
    backdropFilter: 'blur(3px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#f6d7bb',
    border: '2px solid #C4A88E',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '650px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    color: '#2C1A1D',
    boxSizing: 'border-box',
    boxShadow: '0 8px 25px rgba(44, 26, 29, 0.25)'
  },
  closeBtn: {
    position: 'sticky',
    top: '0px',
    float: 'right',
    marginTop: '-8px',
    marginRight: '-18px',
    zIndex: 10,
    background: '#D8C0A8',
    border: 'none', 
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3D1F1D', 
    fontSize: '18px', 
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
  },
  title: {
    textAlign: 'center', 
    marginTop: 0, 
    marginBottom: '20px', 
    fontSize: '22px', 
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  searchContainer: {
    display: 'flex', 
    justifyContent: 'center', 
    gap: '10px', 
    marginBottom: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3D1F1D'
  },
  input: {
    width: '100%', 
    padding: '10px 14px', 
    borderRadius: '8px',
    border: '1px solid #BCA289', 
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D', 
    fontSize: '14px', 
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', 
    padding: '10px 14px', 
    borderRadius: '8px',
    border: '1px solid #BCA289', 
    backgroundColor: '#FFFDF9', 
    color: '#2C1A1D', 
    fontSize: '14px', 
    outline: 'none', 
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  saveBtn: {
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: 'none',
    backgroundColor: '#FAF0E6',
    color: '#2C1A1D',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'opacity 0.2s'
  },
  cancelBtn: {
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    transition: 'opacity 0.2s'
  },
  form: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px'
  },
  field: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
    textAlign: 'left'
  },
  btnGroup: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    marginTop: '10px'
  },
  grid: {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
    gap: '16px', 
    justifyItems: 'center'
  },
  card: {
    width: '100%', 
    backgroundColor: '#FAF0E6',
    borderRadius: '10px', 
    padding: '10px',
    textAlign: 'center', 
    boxSizing: 'border-box', 
    border: '1px solid #C4A88E', 
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  posterImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  posterPlaceholder: {
    width: '100%', 
    height: '150px', 
    backgroundColor: '#EAD7C5', 
    borderRadius: '6px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#7A6258', 
    fontSize: '12px', 
    marginBottom: '8px'
  },
  movieTitle: {
    margin: 0, 
    fontSize: '13px', 
    fontWeight: 'bold', 
    color: '#2C1A1D',
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis'
  },
  movieSubText: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    color: '#5C433E',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  toast: {
    position: 'fixed',
    bottom: '30px',
    right: '20px',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    border: '1px solid #D8C0A8',
    zIndex: 9999,
    pointerEvents: 'none',
    whiteSpace: 'nowrap'
  }
};

export default MovieSearchModal;