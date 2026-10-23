import { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function MovieSearchModal({ onAddWatchedMovie }) {
  const [movies, setMovies] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState('5');
  const [review, setReview] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setSelectedMovie(null);
    setSearchTerm('');
    setSelectedGenre('All');
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
  }, []);

  const availableGenres = [...new Set(
    movies.flatMap(m => {
      if (!m.genre) return [];
      return Array.isArray(m.genre) ? m.genre : [m.genre];
    })
  )];

  const filteredMovies = movies.filter((movie) => {
    const matchesTitle = movie.title ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    let matchesGenre = true;
    if (selectedGenre !== 'All') {
      if (Array.isArray(movie.genre)) {
        matchesGenre = movie.genre.includes(selectedGenre);
      } else {
        matchesGenre = movie.genre === selectedGenre;
      }
    }

    return matchesTitle && matchesGenre;
  });

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const movieRealId = selectedMovie._id || selectedMovie.id;

    const newWatched = {
      id: Date.now(),
      movieId: movieRealId,
      title: selectedMovie.title,
      poster_url: selectedMovie.poster_url,
      rating: Number(rating),
      review: review,
      year: selectedMovie.year || selectedMovie.release_year,
      genre: selectedMovie.genre,
      director: selectedMovie.director,
      overview: selectedMovie.description || selectedMovie.overview || selectedMovie.plot,
      watchedAt: new Date().toLocaleDateString()
    };

    if (onAddWatchedMovie) {
      onAddWatchedMovie(newWatched);
    }

    setToastMessage(`"${selectedMovie.title}" added to your reviews!`);

    setSelectedMovie(null);
    setReview('');
    setRating('5');

    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const renderStars = (currentRating) => {
    const stars = [];
    const num = Number(currentRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= num ? '#B87333' : '#C4A88E', fontSize: '18px', margin: '0 2px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}> 
        {!selectedMovie ? (
          <>
            <div style={styles.headerBanner}>
              <h1 style={styles.mainTitle}>Explore & Rate Movies</h1>
              <p style={styles.subTitle}>Discover movies, share your ratings, and build your personal watch history.</p>
              
              <div style={styles.filterBarWrapper}>
                <input
                  type="text"
                  placeholder="Search for a movie title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.largeInput}
                />

                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={styles.genreSelect}
                >
                  <option value="All">Genres</option>
                  <option value="All">All</option>
                  {availableGenres.map((g, index) => (
                    <option key={index} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading && <p style={styles.statusText}>Fetching movie catalogue...</p>}
            {error && <p style={styles.errorText}>{error}</p>}

            {!loading && !error && (
              <div style={styles.fullGrid}>
                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <div 
                      key={movie._id || movie.id} 
                      style={styles.largeCard}
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <div style={styles.posterContainer}>
                        {movie.poster_url ? (
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title} 
                            style={styles.largePosterImage} 
                          />
                        ) : (
                          <div style={styles.largePosterPlaceholder}>
                            <span>No Poster Available</span>
                          </div>
                        )}
                        <div style={styles.hoverOverlay}>
                          <span style={styles.rateBadge}>View & Rate</span>
                        </div>
                      </div>
                      
                      <div style={styles.cardDetails}>
                        <h3 style={styles.movieTitle}>{movie.title}</h3>
                        
                        <div style={styles.metaRow}>
                          {(movie.year || movie.release_year) && (
                            <span style={styles.yearBadge}>{movie.year || movie.release_year}</span>
                          )}
                          {movie.genre && (
                            <span style={styles.genreText}>
                              {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', ...styles.statusText }}>
                    No movies found matching your search.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={styles.rateSection}>
            <div style={styles.rateCard}>
              <div style={styles.movieDetailsBox}>
                <div style={styles.ratePosterBox}>
                  {selectedMovie.poster_url ? (
                    <img src={selectedMovie.poster_url} alt={selectedMovie.title} style={styles.detailPoster} />
                  ) : (
                    <div style={styles.detailPosterPlaceholder}>No Poster</div>
                  )}
                </div>

                <div style={styles.infoMeta}>
                  <h2 style={styles.movieName}>{selectedMovie.title}</h2>
                  
                  <div style={styles.detailsBadges}>
                    {(selectedMovie.year || selectedMovie.release_year) && (
                      <span style={styles.infoBadge}>Year: {selectedMovie.year || selectedMovie.release_year}</span>
                    )}
                    {selectedMovie.genre && (
                      <span style={styles.infoBadge}>
                        Genre: {Array.isArray(selectedMovie.genre) ? selectedMovie.genre.join(', ') : selectedMovie.genre}
                      </span>
                    )}
                    {selectedMovie.director && (
                      <span style={styles.infoBadge}>Director: {selectedMovie.director}</span>
                    )}
                  </div>

                  {(selectedMovie.description || selectedMovie.overview || selectedMovie.plot) && (
                    <div style={styles.descriptionBox}>
                      <h4 style={styles.descriptionTitle}>Overview</h4>
                      <p style={styles.descriptionText}>
                        {selectedMovie.description || selectedMovie.overview || selectedMovie.plot}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.rateFormBox}>
                <h3 style={styles.rateTitle}>Add Your Rating</h3>

                <form onSubmit={handleLogSubmit} style={styles.form}>
                  <div style={styles.field}>
                    <label style={styles.label}>Your Rating:</label>
                    <select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value)}
                      style={styles.largeSelect}
                    >
                      <option value="1">1 - Very Bad</option>
                      <option value="2">2 - Bad</option>
                      <option value="3">3 - Average</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Masterpiece</option>
                    </select>
                    <div style={styles.starsPreview}>
                      {renderStars(rating)}
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Your Review (optional):</label>
                    <textarea
                      placeholder="What did you think of the movie?"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      style={styles.largeTextarea}
                      rows="5"
                    />
                  </div>

                  <div style={styles.btnGroup}>
                    <button type="submit" style={styles.saveBtn}>Rate Movie</button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedMovie(null)} 
                      style={styles.cancelBtn}
                    >
                      Back to Catalog
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <div style={styles.toast}>
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    width: '100%',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#FAF0E6',
    padding: '20px 40px',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  headerBanner: {
    textAlign: 'center',
    marginBottom: '35px'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#3D1F1D',
    margin: '0 0 10px 0'
  },
  subTitle: {
    fontSize: '16px',
    color: '#5C433E',
    margin: '0 0 25px 0'
  },
  filterBarWrapper: {
    maxWidth: '750px',
    margin: '0 auto',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  largeInput: {
    flex: 1,
    padding: '16px 22px',
    borderRadius: '12px',
    border: '2px solid #C4A88E',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 4px 15px rgba(61, 31, 29, 0.08)'
  },
  genreSelect: {
    padding: '16px 18px',
    borderRadius: '12px',
    border: '2px solid #C4A88E',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '15px',
    fontWeight: 'bold',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(61, 31, 29, 0.08)'
  },
  fullGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '25px',
    paddingBottom: '40px'
  },
  largeCard: {
    backgroundColor: '#D8C0A8',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #C4A88E',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 6px 15px rgba(61, 31, 29, 0.1)'
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    height: '280px',
    backgroundColor: '#EAD7C5',
    overflow: 'hidden'
  },
  largePosterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  largePosterPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A6258',
    fontSize: '13px',
    textAlign: 'center',
    padding: '10px'
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(61, 31, 29, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    ':hover': { opacity: 1 }
  },
  rateBadge: {
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  cardDetails: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1
  },
  movieTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2C1A1D',
    lineHeight: '1.3'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  yearBadge: {
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  genreText: {
    fontSize: '12px',
    color: '#5C433E',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  },
  rateSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '20px'
  },
  rateCard: {
    backgroundColor: '#D8C0A8',
    borderRadius: '16px',
    border: '2px solid #C4A88E',
    padding: '30px',
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    gap: '35px',
    boxShadow: '0 10px 30px rgba(61, 31, 29, 0.15)',
    boxSizing: 'border-box'
  },
  movieDetailsBox: {
    flex: '1.2',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  ratePosterBox: {
    width: '100%',
    maxWidth: '220px'
  },
  detailPoster: {
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '1px solid #C4A88E'
  },
  detailPosterPlaceholder: {
    width: '100%',
    height: '320px',
    backgroundColor: '#EAD7C5',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A6258'
  },
  infoMeta: {
    textAlign: 'left'
  },
  movieName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    margin: '0 0 12px 0'
  },
  detailsBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '15px'
  },
  infoBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4A3228'
  },
  descriptionBox: {
    backgroundColor: '#FAF0E6',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #C4A88E',
    marginTop: '10px'
  },
  descriptionTitle: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    textTransform: 'uppercase'
  },
  descriptionText: {
    margin: 0,
    fontSize: '13px',
    color: '#2C1A1D',
    lineHeight: '1.5'
  },
  rateFormBox: {
    flex: '1',
    textAlign: 'left',
    borderLeft: '1px solid #C4A88E',
    paddingLeft: '25px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  rateTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    margin: '0 0 20px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  largeSelect: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #BCA289',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '15px',
    outline: 'none'
  },
  starsPreview: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px'
  },
  largeTextarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #BCA289',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical'
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  },
  saveBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px'
  },
  cancelBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#8C7A6B',
    color: '#FFFDF9',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px'
  },
  statusText: {
    textAlign: 'center',
    color: '#5C433E',
    fontSize: '16px',
    marginTop: '40px'
  },
  errorText: {
    textAlign: 'center',
    color: '#A84338',
    fontSize: '16px',
    marginTop: '40px'
  },
  toast: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 9999
  }
};

export default MovieSearchModal;