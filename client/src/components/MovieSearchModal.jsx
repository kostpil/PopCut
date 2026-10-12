import { useState } from 'react';

const TEST_MOVIES = [
  { id: 1, title: 'Test1' },
  { id: 2, title: 'Test2' },
  { id: 3, title: 'Test3' },
  { id: 4, title: 'Test4' },
  { id: 5, title: 'Test5' },
  { id: 6, title: 'Test6' },
  { id: 7, title: 'Test7' },
  { id: 8, title: 'Test8' },
];

function MovieSearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredMovies = TEST_MOVIES.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
        <h3 style={styles.title}>Search for a Movie</h3>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Movie title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
          <button style={styles.searchBtn}>🔍</button>
        </div>

        <div style={styles.grid}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} style={styles.card}>
              <div style={styles.posterPlaceholder}>
                <span>Poster Box</span>
              </div>
              <p style={styles.movieTitle}>{movie.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '20px',
    cursor: 'pointer'
  },
  title: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
    color: '#646cff'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px'
  },
  input: {
    width: '70%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2b2b2b',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none'
  },
  searchBtn: {
    padding: '10px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#646cff', 
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '16px',
    justifyItems: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#2b2b2b',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    boxSizing: 'border-box',
    border: '1px solid #444'
  },
  posterPlaceholder: {
    width: '100%',
    height: '150px',
    backgroundColor: '#3a3a3a',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: '12px',
    marginBottom: '8px'
  },
  movieTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default MovieSearchModal;