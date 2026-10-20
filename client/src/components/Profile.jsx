  import { useState, useEffect } from 'react';
  import MovieSearchModal from './MovieSearchModal';

  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://moviebook-2-production.up.railway.app';

  function Profile({ user: initialUser, onLogout }) {
    const [user, setUser] = useState(initialUser);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [watchedMovies, setWatchedMovies] = useState([]);

    const [editingMovieId, setEditingMovieId] = useState(null);
    const [editRating, setEditRating] = useState('5');
    const [editReview, setEditReview] = useState('');

    useEffect(() => {
      const token = localStorage.getItem('token');
      
      if (token) {
        fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then((res) => {
            if (res.status === 401) {
              throw new Error('Unauthorized - Please log in again.');
            }
            if (!res.ok) {
              throw new Error('Failed to fetch profile');
            }
            return res.json();
          })
          .then((data) => {
            if (data) {
              setUser(data);
            }
          })
          .catch((err) => console.error("Error fetching profile:", err));
      }

      const saved = localStorage.getItem(`watchedMovies_${initialUser?.email || 'default'}`);
      if (saved) {
        try {
          setWatchedMovies(JSON.parse(saved));
        } catch (err) {
          console.error("Failed to parse saved movies", err);
        }
      }
    }, []);

    const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    const updateAndSaveMovies = (newList) => {
      setWatchedMovies(newList);
      localStorage.setItem(`watchedMovies_${user?.email || 'default'}`, JSON.stringify(newList));
    };

    const handleAddWatchedMovie = (movie) => {
      const updated = [movie, ...watchedMovies];
      updateAndSaveMovies(updated);
    };

    const handleDeleteMovie = (id) => {
      const updated = watchedMovies.filter((m) => m.id !== id);
      updateAndSaveMovies(updated);
    };

    const handleStartEdit = (movie) => {
      setEditingMovieId(movie.id);
      setEditRating(String(movie.rating));
      setEditReview(movie.review || '');
    };

    const handleSaveEdit = (id) => {
      const updated = watchedMovies.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            rating: Number(editRating),
            review: editReview
          };
        }
        return m;
      });
      updateAndSaveMovies(updated);
      setEditingMovieId(null);
    };

    const userAge = user?.age !== undefined && user?.age !== null ? user.age : 'N/A';

    return (
      <div style={styles.container}>
        <h2 style={styles.title}>My Profile</h2>

        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>{initial}</div>
        </div>

        <div style={styles.infoGroup}>
          <p style={styles.infoText}>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>
          <p style={styles.infoText}>
            <strong>Age:</strong> {userAge}
          </p>
          {(user?.firstName || user?.first_name) && (
            <p style={styles.infoText}>
              <strong>Name:</strong> {user.firstName || user.first_name} {user.lastName || user.last_name || ''}
            </p>
          )}
        </div>

        <button 
          onClick={() => setIsSearchOpen(true)} 
          style={styles.searchBtn}
        >
           Search & Rate Movies
        </button>

        <div style={styles.watchedSection}>
          <h3 style={styles.subTitle}>My Watched Movies ({watchedMovies.length})</h3>
          {watchedMovies.length === 0 ? (
            <p style={styles.emptyText}>No movies logged yet.</p>
          ) : (
            <div style={styles.movieList}>
              {watchedMovies.map((m) => {
                const isEditing = editingMovieId === m.id;

                return (
                  <div key={m.id} style={styles.movieItem}>
                    {isEditing ? (
                      <div style={styles.editBox}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#646cff' }}>
                          Edit: {m.title}
                        </p>
                        
                        <div style={styles.fieldGroup}>
                          <label style={{ fontSize: '12px' }}>Rating:</label>
                          <select 
                            value={editRating} 
                            onChange={(e) => setEditRating(e.target.value)}
                            style={styles.editInput}
                          >
                            <option value="1">⭐ 1/5</option>
                            <option value="2">⭐⭐ 2/5</option>
                            <option value="3">⭐⭐⭐ 3/5</option>
                            <option value="4">⭐⭐⭐⭐ 4/5</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                          </select>
                        </div>

                        <div style={styles.fieldGroup}>
                          <label style={{ fontSize: '12px' }}>Review:</label>
                          <textarea 
                            value={editReview} 
                            onChange={(e) => setEditReview(e.target.value)}
                            style={styles.editTextarea}
                            rows="2"
                          />
                        </div>

                        <div style={styles.actionRow}>
                          <button onClick={() => handleSaveEdit(m.id)} style={styles.saveBtn}>
                            Save
                          </button>
                          <button onClick={() => setEditingMovieId(null)} style={styles.cancelBtn}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.movieHeader}>
                          <strong>{m.title}</strong>
                          <span style={styles.rating}>⭐ {m.rating}/5</span>
                        </div>
                        {m.review && <p style={styles.reviewText}>"{m.review}"</p>}
                        <small style={styles.dateText}>Logged on: {m.watchedAt}</small>

                        <div style={styles.actionRow}>
                          <button onClick={() => handleStartEdit(m)} style={styles.editBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteMovie(m.id)} style={styles.deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>

        <MovieSearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onAddWatchedMovie={handleAddWatchedMovie}
        />
      </div>
    );
  }

 const styles = {
  container: {
    width: '100%',
    maxWidth: '450px',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(61, 31, 29, 0.12)',
    backgroundColor: '#D8C0A8',
    color: '#2C1A1D',
    boxSizing: 'border-box',
    textAlign: 'left',
    border: '2px solid #ddcfb7'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3D1F1D', 
    textAlign: 'center'
  },
  subTitle: {
    fontSize: '16px',
    color: '#3D1F1D',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  avatarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#3D1F1D', 
    color: '#FAF0E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
    backgroundColor: '#FAF0E6',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #C4A88E'
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#2C1A1D'
  },
  watchedSection: {
    marginBottom: '20px',
    borderTop: '1px solid #C4A88E',
    paddingTop: '16px'
  },
  emptyText: {
    fontSize: '13px',
    color: '#5C433E',
    fontStyle: 'italic'
  },
  movieList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '240px',
    overflowY: 'auto'
  },
  movieItem: {
    backgroundColor: '#FAF0E6',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #C4A88E'
  },
  movieHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '4px'
  },
  rating: {
    color: '#B87333', 
    fontWeight: 'bold'
  },
  reviewText: {
    margin: '6px 0',
    fontSize: '13px',
    color: '#4A3228',
    fontStyle: 'italic'
  },
  dateText: {
    fontSize: '11px',
    color: '#7A6258'
  },
  searchBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#FAF0E6', 
    color: '#2C1A1D',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  logoutBtn: {
    width: '100%',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#A84338', 
    color: '#FAF0E6',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px'
  },
  editBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  deleteBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#A84338', 
    color: '#FFFDF9',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  editBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  editInput: {
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #BCA289',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '12px',
    outline: 'none'
  },
  editTextarea: {
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #BCA289',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '12px',
    resize: 'vertical',
    outline: 'none'
  },
  saveBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#8C7A6B',
    color: '#FFFDF9',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

  export default Profile;