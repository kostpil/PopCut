import { useState } from 'react';
import MovieSearchModal from './MovieSearchModal';

function Profile({ user, onLogout }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
<<<<<<< HEAD
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

=======
  const [watchedMovies, setWatchedMovies] = useState([]);

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const handleAddWatchedMovie = (movie) => {
    setWatchedMovies([movie, ...watchedMovies]);
  };

>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Profile</h2>

      <div style={styles.avatarContainer}>
        <div style={styles.avatar}>{initial}</div>
      </div>

      <div style={styles.infoGroup}>
        <p style={styles.infoText}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={styles.infoText}>
          <strong>Age:</strong> {user?.age || '44'}
        </p>
        {user?.firstName && (
          <p style={styles.infoText}>
            <strong>Name:</strong> {user.firstName} {user.lastName || ''}
          </p>
        )}
      </div>

      <button 
        onClick={() => setIsSearchOpen(true)} 
        style={styles.searchBtn}
      >
<<<<<<< HEAD
        🔍 Search Movies
      </button>

=======
        🔍 Search & Log Movies
      </button>

      {/* ΛΙΣΤΑ ΜΕ WATCHED MOVIES */}
      <div style={styles.watchedSection}>
        <h3 style={styles.subTitle}>My Watched Movies ({watchedMovies.length})</h3>
        {watchedMovies.length === 0 ? (
          <p style={styles.emptyText}>No movies logged yet. Search and add some!</p>
        ) : (
          <div style={styles.movieList}>
            {watchedMovies.map((m) => (
              <div key={m.id} style={styles.movieItem}>
                <div style={styles.movieHeader}>
                  <strong>{m.title}</strong>
                  <span style={styles.rating}>⭐ {m.rating}/5</span>
                </div>
                {m.review && <p style={styles.reviewText}>"{m.review}"</p>}
                <small style={styles.dateText}>Logged on: {m.watchedAt}</small>
              </div>
            ))}
          </div>
        )}
      </div>

>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
      <button onClick={onLogout} style={styles.logoutBtn}>
        Logout
      </button>

      <MovieSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
<<<<<<< HEAD
=======
        onAddWatchedMovie={handleAddWatchedMovie}
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
<<<<<<< HEAD
    maxWidth: '400px',
=======
    maxWidth: '450px',
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
    padding: '24px',
    borderRadius: '8px',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
    fontWeight: '600'
  },
<<<<<<< HEAD
=======
  subTitle: {
    fontSize: '16px',
    color: '#646cff',
    marginBottom: '10px'
  },
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
  avatarContainer: {
    marginBottom: '20px'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
<<<<<<< HEAD
    backgroundColor: '#646cff', 
=======
    backgroundColor: '#646cff',
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
<<<<<<< HEAD
    marginBottom: '24px'
=======
    marginBottom: '20px'
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
  },
  infoText: {
    margin: 0,
    fontSize: '15px',
    color: '#e0e0e0'
  },
<<<<<<< HEAD
=======
  watchedSection: {
    marginBottom: '24px',
    borderTop: '1px solid #333',
    paddingTop: '16px'
  },
  emptyText: {
    fontSize: '13px',
    color: '#888',
    fontStyle: 'italic'
  },
  movieList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  movieItem: {
    backgroundColor: '#2b2b2b',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #444'
  },
  movieHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '4px'
  },
  rating: {
    color: '#f5c518',
    fontWeight: 'bold'
  },
  reviewText: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#ccc',
    fontStyle: 'italic'
  },
  dateText: {
    fontSize: '11px',
    color: '#778'
  },
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
  searchBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#646cff',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
<<<<<<< HEAD
    marginBottom: '12px'
=======
    marginBottom: '16px'
>>>>>>> 24b2dae6717ab7168927144d42519fef1c3fdeca
  },
  logoutBtn: {
    width: '100%',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Profile;