import { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function Profile({ user: initialUser, onLogout, profileUserId }) {
  const profileUserObj = typeof profileUserId === 'object' && profileUserId !== null ? profileUserId : null;
  const cleanProfileId = profileUserObj 
    ? (profileUserObj._id || profileUserObj.id || profileUserObj.userId || profileUserObj.sub || profileUserObj.email || profileUserObj.username)
    : profileUserId;

  const currentUserId = initialUser?._id || initialUser?.id;
  const currentUserEmail = initialUser?.email;

  const isOwnProfile = !cleanProfileId || 
    (currentUserId && String(cleanProfileId) === String(currentUserId)) || 
    (currentUserEmail && String(cleanProfileId) === String(currentUserEmail)) ||
    (profileUserObj && (
      (currentUserId && String(profileUserObj._id || profileUserObj.id) === String(currentUserId)) ||
      (currentUserEmail && String(profileUserObj.email) === String(currentUserEmail))
    ));

  const [user, setUser] = useState(initialUser);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [allCatalogMovies, setAllCatalogMovies] = useState([]);

  const [editingMovieId, setEditingMovieId] = useState(null);
  const [editRating, setEditRating] = useState('5');
  const [editReview, setEditReview] = useState('');

  useEffect(() => {
    if (isOwnProfile && initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, isOwnProfile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = initialUser?.email || user?.email || 'default';
    
    if (!isOwnProfile && cleanProfileId) {
      if (profileUserObj) {
        setUser(profileUserObj);
      }

      fetch(`${API_BASE_URL}/api/watched/user/${cleanProfileId}`)
        .then(res => res.ok ? res.json() : [])
        .then(userData => {
          const userMovies = Array.isArray(userData) ? userData : [];

          if (userMovies.length > 0 && userMovies[0].user_id && typeof userMovies[0].user_id === 'object') {
            setUser(prev => ({ ...(prev || {}), ...userMovies[0].user_id }));
          } else if (!profileUserObj) {
            setUser({ username: String(cleanProfileId) });
          }

          const formatted = userMovies.map(item => {
            const itemId = item._id || item.id;
            const movieIdStr = typeof item.movie_id === 'object' ? (item.movie_id?._id || item.movie_id?.id) : item.movie_id;
            
            const catalogMovie = allCatalogMovies.find(
              (m) => String(m._id || m.id) === String(movieIdStr) ||
                     m.title?.toLowerCase() === item.movie_id?.title?.toLowerCase()
            );

            return {
              id: itemId, 
              movieId: movieIdStr,
              title: item.movie_id?.title || catalogMovie?.title || 'Unknown Movie',
              poster_url: item.movie_id?.poster_url || catalogMovie?.poster_url,
              year: item.movie_id?.year || catalogMovie?.year || catalogMovie?.release_year,
              rating: item.rating,
              review: item.review,
              rawDate: item.watchedAt || item.createdAt,
              watchedAt: item.watchedAt ? new Date(item.watchedAt).toLocaleDateString() : ''
            };
          });
          setWatchedMovies(formatted);
        })
        .catch(err => console.error("Error fetching other user watched movies:", err));

    } else {
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
              setUser(prev => ({ ...(prev || {}), ...data }));
            }
          })
          .catch((err) => console.error("Error fetching profile:", err));

        fetch(`${API_BASE_URL}/api/watched`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then((res) => res.ok ? res.json() : [])
          .then((data) => {
            if (Array.isArray(data)) {
              const localEdits = JSON.parse(localStorage.getItem(`watchedEdits_${userEmail}`) || '{}');
              const localWatched = JSON.parse(localStorage.getItem(`watched_${userEmail}`) || '[]');
              const deletedIds = JSON.parse(localStorage.getItem(`watchedDeletes_${userEmail}`) || '[]');
              const permDeleted = JSON.parse(localStorage.getItem(`permDeletedMovies_${userEmail}`) || '[]');

              const formatted = data
                .filter(item => {
                  const itemId = item._id || item.id;
                  const movieIdStr = typeof item.movie_id === 'object' ? (item.movie_id?._id || item.movie_id?.id) : item.movie_id;
                  return !deletedIds.includes(itemId) && !deletedIds.includes(movieIdStr) && !permDeleted.includes(movieIdStr);
                })
                .map(item => {
                  const itemId = item._id || item.id;
                  const movieIdStr = typeof item.movie_id === 'object' ? (item.movie_id?._id || item.movie_id?.id) : item.movie_id;
                  const savedEdit = localEdits[itemId] || {};
                  
                  // Βρίσκουμε αν υπάρχει τοπικά αποθηκευμένη πιο φρέσκια ημερομηνία
                  const localMatch = localWatched.find(lw => String(lw.movieId || lw.movie_id?._id || lw.movie_id) === String(movieIdStr));
                  const finalDate = localMatch?.watchedAt || item.watchedAt || item.createdAt;

                  return {
                    id: itemId, 
                    movieId: movieIdStr,
                    title: item.movie_id?.title || 'Unknown Movie',
                    poster_url: item.movie_id?.poster_url,
                    year: item.movie_id?.year,
                    rating: savedEdit.rating !== undefined ? savedEdit.rating : item.rating,
                    review: savedEdit.review !== undefined ? savedEdit.review : item.review,
                    rawDate: finalDate,
                    watchedAt: finalDate ? new Date(finalDate).toLocaleDateString() : ''
                  };
                });

              // Ταξινόμηση ώστε οι πιο πρόσφατες να έρχονται επάνω
              formatted.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

              setWatchedMovies(formatted);
            }
          })
          .catch((err) => console.error("Error fetching watched movies from server:", err));
      }
    }

    fetch(`${API_BASE_URL}/api/movies`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAllCatalogMovies(data))
      .catch((err) => console.error("Error fetching catalog movies:", err));
  }, [cleanProfileId, isOwnProfile]);

 const handleDeleteMovie = async (movieItem) => {
    if (!isOwnProfile) return;
    const targetId = movieItem._id || movieItem.id;
    const movieIdStr = movieItem.movieId || (typeof movieItem.movie_id === 'object' ? movieItem.movie_id?._id || movieItem.movie_id?.id : movieItem.movie_id);
    const token = localStorage.getItem('token');
    const userEmail = user?.email || 'default';
    
    try {
      if (token && targetId) {
        await fetch(`${API_BASE_URL}/api/watched/${targetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Server delete failed, handling locally:", err);
    }

    const updated = watchedMovies.filter((m) => (m._id || m.id) !== targetId);
    setWatchedMovies(updated);

    const localEdits = JSON.parse(localStorage.getItem(`watchedEdits_${userEmail}`) || '{}');
    delete localEdits[targetId];
    localStorage.setItem(`watchedEdits_${userEmail}`, JSON.stringify(localEdits));

    // --- ΔΙΟΡΘΩΣΗ ΕΔΩ: Αποθηκεύουμε ΜΟΝΟ το targetId (watched ID) στα deletes για να μην επηρεάζονται οι άλλοι χρήστες ---
    let deletedIds = JSON.parse(localStorage.getItem(`watchedDeletes_${userEmail}`) || '[]');
    if (targetId && !deletedIds.includes(targetId)) deletedIds.push(targetId);
    localStorage.setItem(`watchedDeletes_${userEmail}`, JSON.stringify(deletedIds));

    let permDeleted = JSON.parse(localStorage.getItem(`permDeletedMovies_${userEmail}`) || '[]');
    if (movieIdStr && !permDeleted.includes(movieIdStr)) {
      permDeleted.push(movieIdStr);
      localStorage.setItem(`permDeletedMovies_${userEmail}`, JSON.stringify(permDeleted));
    }

    const localWatched = JSON.parse(localStorage.getItem(`watched_${userEmail}`) || '[]');
    const cleanedWatched = localWatched.filter(m => (m._id || m.id) !== targetId);
    localStorage.setItem(`watched_${userEmail}`, JSON.stringify(cleanedWatched));

    window.dispatchEvent(new Event('watched_updated'));
  };
  
  const handleStartEdit = (movie) => {
    if (!isOwnProfile) return;
    setEditingMovieId(movie.id);
    setEditRating(String(movie.rating));
    setEditReview(movie.review || '');
  };

  const handleSaveEdit = async (id) => {
    if (!isOwnProfile) return;
    const token = localStorage.getItem('token');
    const userEmail = user?.email || 'default';
    const newRatingNum = Number(editRating);

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/watched/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: newRatingNum,
            review: editReview
          })
        });
      }
    } catch (err) {
      console.error("Server update failed, falling back to local storage:", err);
    }

    const localEdits = JSON.parse(localStorage.getItem(`watchedEdits_${userEmail}`) || '{}');
    localEdits[id] = { rating: newRatingNum, review: editReview };
    localStorage.setItem(`watchedEdits_${userEmail}`, JSON.stringify(localEdits));

    const updated = watchedMovies.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          rating: newRatingNum,
          review: editReview
        };
      }
      return m;
    });
    setWatchedMovies(updated);
    setEditingMovieId(null);

    window.dispatchEvent(new Event('watched_updated'));
  };

  const handleOpenMovieDetail = (watchedMovie) => {
    const catalogMovie = allCatalogMovies.find(
      (m) => String(m._id || m.id) === String(watchedMovie.movieId || watchedMovie.id) ||
             m.title?.toLowerCase() === watchedMovie.title?.toLowerCase()
    );

    const fullMovieData = {
      ...watchedMovie,
      poster_url: watchedMovie.poster_url || catalogMovie?.poster_url,
      year: watchedMovie.year || catalogMovie?.year || catalogMovie?.release_year,
      director: watchedMovie.director || catalogMovie?.director,
      genre: watchedMovie.genre || catalogMovie?.genre,
      overview: watchedMovie.overview || catalogMovie?.description || catalogMovie?.overview || catalogMovie?.plot
    };

    setSelectedMovie(fullMovieData);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#B87333' : '#C4A88E', fontSize: '15px', margin: '0 1px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const userAge = user?.age !== undefined && user?.age !== null && user?.age !== '' ? user.age : null;
  const initialLetter = (user?.firstName || user?.first_name || user?.username || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.username || user?.firstName || user?.first_name || user?.email || 'Movie Lover';

  return (
    <div style={styles.container}>
      <div style={styles.avatarWrapper}>
        <div style={styles.avatarCircle}>
          {initialLetter}
        </div>
      </div>

      <h2 style={styles.title}>{isOwnProfile ? 'My Profile' : `${displayName}'s Profile`}</h2>

      <div style={styles.infoGroup}>
        <p style={styles.infoText}>
          <strong>Email:</strong> {user?.email || user?.username || 'N/A'}
        </p>

        {(isOwnProfile || userAge !== null) && (
          <p style={styles.infoText}>
            <strong>Age:</strong> {userAge !== null ? userAge : 'N/A'}
          </p>
        )}

        {(user?.firstName || user?.first_name) && (
          <p style={styles.infoText}>
            <strong>Name:</strong> {user.firstName || user.first_name} {user.lastName || user.last_name || ''}
          </p>
        )}
      </div>

      <div style={styles.watchedSection}>
        <h3 style={styles.subTitle}>
          {isOwnProfile ? `My Watched Movies (${watchedMovies.length})` : `Watched Movies (${watchedMovies.length})`}
        </h3>
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
                      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#3D1F1D' }}>
                        Edit: {m.title}
                      </p>
                      
                      <div style={styles.fieldGroup}>
                        <label style={{ fontSize: '12px' }}>Rating:</label>
                        <select 
                          value={editRating} 
                          onChange={(e) => setEditRating(e.target.value)}
                          style={styles.editInput}
                        >
                          <option value="1">1/5</option>
                          <option value="2">2/5</option>
                          <option value="3">3/5</option>
                          <option value="4">4/5</option>
                          <option value="5">5/5</option>
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
                        <strong 
                          style={{ cursor: 'pointer', textDecoration: 'underline', color: '#3D1F1D' }} 
                          onClick={() => handleOpenMovieDetail(m)}
                          title="Click to view movie details"
                        >
                          {m.title}
                        </strong>
                        <span style={styles.rating}>★ {m.rating}/5</span>
                      </div>
                      {m.review && <p style={styles.reviewText}>"{m.review}"</p>}
                      <small style={styles.dateText}>Logged on: {m.watchedAt}</small>

                      {isOwnProfile && (
                        <div style={styles.actionRow}>
                          <button onClick={() => handleStartEdit(m)} style={styles.editBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteMovie(m)} style={styles.deleteBtn}>
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>
      )}

      {selectedMovie && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMovie(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalCloseBtn} onClick={() => setSelectedMovie(null)}>✕</button>
            
            <div style={styles.modalBody}>
              {selectedMovie.poster_url ? (
                <img src={selectedMovie.poster_url} alt={selectedMovie.title} style={styles.modalPoster} />
              ) : (
                <div style={styles.modalPosterPlaceholder}>No Poster</div>
              )}
              
              <div style={styles.modalInfo}>
                <h3 style={styles.modalTitle}>
                  {selectedMovie.title} {selectedMovie.year && <span style={{fontSize: '14px', color: '#5C433E'}}>({selectedMovie.year})</span>}
                </h3>
                
                {selectedMovie.director && (
                  <p style={styles.modalMeta}><strong>Director:</strong> {selectedMovie.director}</p>
                )}
                {selectedMovie.genre && (
                  <p style={styles.modalMeta}>
                    <strong>Genre:</strong> {Array.isArray(selectedMovie.genre) ? selectedMovie.genre.join(', ') : selectedMovie.genre}
                  </p>
                )}

                {selectedMovie.overview && (
                  <div style={styles.modalOverviewBox}>
                    <strong>Overview:</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', lineHeight: '1.3' }}>
                      {selectedMovie.overview}
                    </p>
                  </div>
                )}

                <div style={styles.modalReviewBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '12px' }}>Rating:</strong>
                    <div>{renderStars(selectedMovie.rating)}</div>
                  </div>
                  {selectedMovie.review && (
                    <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: '#4A3228' }}>
                      "{selectedMovie.review}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setSelectedMovie(null)} 
              style={styles.closeModalBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '450px',
    margin: '20px auto',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(61, 31, 29, 0.12)',
    backgroundColor: '#D8C0A8',
    color: '#2C1A1D',
    boxSizing: 'border-box',
    textAlign: 'left',
    border: '2px solid #ddcfb7'
  },
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  avatarCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    border: '2px solid #C4A88E',
    boxShadow: '0 2px 6px rgba(61, 31, 29, 0.2)'
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(61, 31, 29, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '15px'
  },
  modalContent: {
    backgroundColor: '#FAF0E6',
    border: '2px solid #C4A88E',
    borderRadius: '14px',
    padding: '20px',
    width: '100%',
    maxWidth: '460px',
    position: 'relative',
    color: '#2C1A1D',
    boxShadow: '0 10px 25px rgba(61, 31, 29, 0.2)',
    boxSizing: 'border-box'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#3D1F1D',
    fontWeight: 'bold'
  },
  modalBody: {
    display: 'flex',
    gap: '14px',
    marginTop: '6px',
    alignItems: 'flex-start'
  },
  modalPoster: {
    width: '110px',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #C4A88E',
    flexShrink: 0
  },
  modalPosterPlaceholder: {
    width: '110px',
    height: '160px',
    backgroundColor: '#EAD7C5',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A6258',
    fontSize: '11px',
    flexShrink: 0,
    textAlign: 'center',
    padding: '5px'
  },
  modalInfo: {
    flex: 1,
    textAlign: 'left'
  },
  modalTitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  modalMeta: {
    margin: '2px 0',
    fontSize: '12px',
    color: '#4A3228'
  },
  modalOverviewBox: {
    marginTop: '6px',
    backgroundColor: '#FFFDF9',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #C4A88E',
    fontSize: '12px'
  },
  modalReviewBox: {
    marginTop: '8px',
    backgroundColor: '#EAD7C5',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #C4A88E'
  },
  closeModalBtn: {
    width: '100%',
    marginTop: '15px',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};

export default Profile;