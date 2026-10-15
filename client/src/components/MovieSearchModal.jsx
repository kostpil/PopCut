import { useState, useEffect } from 'react';

function MovieSearchModal({ isOpen, onClose, onAddWatchedMovie }) {
  const [movies, setMovies] = useState([]); // Αποθήκευση ταινιών από τη MongoDB
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');

  // Φόρτωση ταινιών από το backend μόλις ανοίγει το modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      fetch('http://localhost:3000/api/movies')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Αποτυχία φόρτωσης ταινιών');
          }
          return response.json();
        })
        .then((data) => {
          setMovies(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Σφάλμα κατά τη φόρτωση:', err);
          setError('Δεν ήταν δυνατή η φόρτωση των ταινιών.');
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Φιλτράρισμα των ταινιών που ήρθαν από τη MongoDB
  const filteredMovies = movies.filter((movie) =>
    movie.title ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const newWatched = {
      id: Date.now(),
      movieId: selectedMovie._id || selectedMovie.id,
      title: selectedMovie.title,
      rating: Number(rating),
      review: review,
      watchedAt: new Date().toLocaleDateString()
    };

    if (onAddWatchedMovie) {
      onAddWatchedMovie(newWatched);
    }

    alert(`Η ταινία "${selectedMovie.title}" καταγράφηκε επιτυχώς!`);
    setSelectedMovie(null);
    setReview('');
    setRating('5');
  };

  return (
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

            <p style={styles.hint}>Κάνε κλικ σε μια ταινία για να την καταγράψεις (Log Movie)</p>

            {loading && <p style={{ textAlign: 'center', color: '#aaa' }}>Φόρτωση ταινιών...</p>}
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
                      <div style={styles.posterPlaceholder}>
                        <span>Poster Box</span>
                      </div>
                      <p style={styles.movieTitle}>{movie.title}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa' }}>
                    Δεν βρέθηκαν ταινίες.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <h3 style={styles.title}>Log Movie: {selectedMovie.title}</h3>
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
                  placeholder="Write your thoughts..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  style={styles.textarea}
                  rows="4"
                />
              </div>

              <div style={styles.btnGroup}>
                <button type="submit" style={styles.searchBtn}>Save Movie</button>
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
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#1e1e1e',
    border: '2px solid #646cff',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '650px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    color: '#ffffff',
    boxSizing: 'border-box',
    boxShadow: '0 0 20px rgba(100, 108, 255, 0.3)'
  },
  closeBtn: {
    position: 'absolute', top: '16px', right: '16px',
    background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer'
  },
  title: {
    textAlign: 'center', marginTop: 0, marginBottom: '20px', fontSize: '22px', color: '#646cff'
  },
  hint: {
    textAlign: 'center', fontSize: '13px', color: '#aaa', marginBottom: '16px'
  },
  searchContainer: {
    display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px'
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid #444', backgroundColor: '#2b2b2b', color: '#ffffff', fontSize: '14px', outline: 'none'
  },
  textarea: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid #444', backgroundColor: '#2b2b2b', color: '#ffffff', fontSize: '14px', outline: 'none', resize: 'vertical'
  },
  searchBtn: {
    width: '100%', padding: '12px', borderRadius: '6px', border: 'none',
    backgroundColor: '#646cff', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold'
  },
  cancelBtn: {
    width: '100%', padding: '12px', borderRadius: '6px', border: 'none',
    backgroundColor: '#444', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold'
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '16px'
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left'
  },
  btnGroup: {
    display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', justifyItems: 'center'
  },
  card: {
    width: '100%', backgroundColor: '#2b2b2b', borderRadius: '8px', padding: '10px',
    textAlign: 'center', boxSizing: 'border-box', border: '1px solid #444', cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  posterPlaceholder: {
    width: '100%', height: '150px', backgroundColor: '#3a3a3a', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px', marginBottom: '8px'
  },
  movieTitle: {
    margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#ffffff',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
  }
};

export default MovieSearchModal;