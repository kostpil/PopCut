import { useState, useEffect } from 'react';
import logo from '../assets/popcut.png';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function HomePage({ user, onNavigateToAuth }) {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/movies`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMovies(data);
        }
      })
      .catch((err) => console.error("Error fetching movies for carousel:", err));
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/watched/feed`, {
          cache: 'no-store'
        });
        let data = [];
        if (res.ok) {
          data = await res.json();
        } else {
          const resFallback = await fetch(`${API_BASE_URL}/api/feed`);
          if (resFallback.ok) {
            data = await resFallback.json();
          }
        }

        let items = Array.isArray(data) ? data : [];

        const savedUser = localStorage.getItem('user');
        const userObj = savedUser ? JSON.parse(savedUser) : null;
        
        const userEmail = userObj?.email || userObj?.username || null;

        const localEdits = userEmail ? JSON.parse(localStorage.getItem(`watchedEdits_${userEmail}`) || '{}') : {};
        const localWatched = userEmail ? JSON.parse(localStorage.getItem(`watched_${userEmail}`) || '[]') : [];
        const deletedIds = userEmail ? JSON.parse(localStorage.getItem(`watchedDeletes_${userEmail}`) || '[]') : [];

        items = items
          .filter(item => {
            const itemId = item._id || item.id;
            return !deletedIds.includes(itemId);
          })
          .map(item => {
            const id = item._id || item.id;
            const movieId = item.movie_id?._id || item.movie_id?.id || item.movie_id;
            const itemUserEmail = item.user_id?.email || item.user_id?.username;

            let finalDate = item.watchedAt || item.createdAt;
            if (userEmail && itemUserEmail === userEmail) {
              const localMatch = localWatched.find(lw => String(lw.movieId || lw.movie_id?._id || lw.movie_id) === String(movieId));
              if (localMatch && localMatch.watchedAt) {
                finalDate = localMatch.watchedAt;
              }
            }

            let updatedItem = {
              ...item,
              rawDate: finalDate
            };

            if (userEmail && localEdits[id]) {
              updatedItem.rating = localEdits[id].rating !== undefined ? localEdits[id].rating : updatedItem.rating;
              updatedItem.review = localEdits[id].review !== undefined ? localEdits[id].review : updatedItem.review;
            }
            return updatedItem;
          });

        items.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        setLatestReviews(items.slice(0, 4));
      } catch (err) {
        console.error("Error fetching latest reviews:", err);
      }
    };
    fetchReviews();
  }, [user]);

  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [movies]);

  const getVisibleMovies = () => {
    if (movies.length === 0) return [];
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + movies.length) % movies.length;
      visible.push({ ...movies[index], offset: i });
    }
    return visible;
  };

  const renderStars = (rating) => {
    const stars = [];
    const num = Number(rating) || 5;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= num ? '#B87333' : '#C4A88E', fontSize: '12px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={styles.homeContainer}>
      <img src={logo} alt="PopCut Logo" style={styles.logo} />
      <div style={styles.tagline}>MOVIES · POP-CORN · OPINIONS</div>

      <div style={styles.carouselContainer}>
        {movies.length > 0 ? (
          <div style={styles.carouselTrack}>
            {getVisibleMovies().map((movie, idx) => {
              const isCenter = movie.offset === 0;
              const isOuter = Math.abs(movie.offset) === 2;

              return (
                <div 
                  key={idx} 
                  style={{
                    ...styles.carouselCard,
                    transform: isCenter 
                      ? 'scale(1.18)' 
                      : isOuter 
                      ? 'scale(0.90)'  
                      : 'scale(1.0)',
                    zIndex: isCenter ? 4 : isOuter ? 1 : 2,
                    opacity: isOuter ? 0.6 : isCenter ? 1 : 0.85,
                  }}
                >
                  {movie?.poster_url ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      style={styles.carouselPoster} 
                    />
                  ) : (
                    <div style={styles.placeholder}>{movie?.title || 'PopCut'}</div>
                  )}
                  {isCenter && (
                    <div style={styles.movieTitleOverlay}>
                      {movie.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#7A6258', fontSize: '13px' }}>Loading cinematic carousel...</p>
        )}
      </div>

      <div style={styles.feedContainer}>
        <h3 style={styles.feedTitle}>RECENT REVIEWS</h3>
        
        <div style={styles.reviewsGrid}>
          {latestReviews.length > 0 ? (
            latestReviews.map((item, index) => {
              const movie = item.movie_id || {};
              const username = item.user_id?.username || item.user_id?.email || 'Movie Lover';
              const rating = item.rating || 5;
              const reviewText = item.review || item.comment || item.text || '';
              const movieTitle = movie.title || item.movie_title || 'Featured Film';

              return (
                <div key={index} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.cardMovieTitle}>{movieTitle}</span>
                    <div style={styles.reviewRating}>{renderStars(rating)}</div>
                  </div>
                  {reviewText && <p style={styles.reviewComment}>"{reviewText}"</p>}
                  <span style={styles.reviewAuthor}>By: {username}</span>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#7A6258', fontSize: '13px', padding: '20px 0' }}>
              No recent reviews found yet. Be the first to add one!
            </div>
          )}
        </div>
      </div>

      {!user && (
        <div style={styles.joinSection}>
          <button 
            onClick={() => {
              if (onNavigateToAuth) onNavigateToAuth('login');
            }} 
            style={styles.joinBtn}
          >
            Join Our Community
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  homeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '20px 20px',
    boxSizing: 'border-box'
  },
  logo: {
    width: '330px',            
    height: 'auto',
    marginBottom: '0px',    
    marginTop: '-25px',
    display: 'block',        
    objectFit: 'contain'
  },
  tagline: { 
    fontSize: '14.5px',
    fontWeight: '900', 
    letterSpacing: '5px',
    color: '#A84338',
    marginTop: '19px',
    marginBottom: '7px',    
    textTransform: 'uppercase'
  },
  carouselContainer: {
    width: '100%',
    height: '340px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '15px'
  },
  carouselTrack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px', 
    width: '100%',
    transition: 'all 0.5s ease-in-out'
  },
  carouselCard: {
    width: '160px',
    height: '240px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#3D1F1D',
    boxShadow: '0 8px 20px rgba(61, 31, 29, 0.2)',
    transition: 'transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease',
    position: 'relative',
    flexShrink: 0,
    border: '2px solid #D8C0A8'
  },
  carouselPoster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    textAlign: 'center',
    padding: '10px'
  },
  movieTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(61, 31, 29, 0.85)',
    color: '#FAF0E6',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '6px 8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  feedContainer: {
    width: '100%',
    maxWidth: '900px', 
    margin: '20px auto 10px auto',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  feedTitle: { 
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#A84338',  
    marginTop: '-15px',    
    marginBottom: '20px',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '15px',                         
    boxSizing: 'border-box'
  },
  reviewCard: {
    backgroundColor: '#FFFDF9',             
    border: '1px solid #D8C0A8',
    borderRadius: '12px',
    padding: '16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(61, 31, 29, 0.06)'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  cardMovieTitle: {
    fontWeight: '700',
    fontSize: '13px',
    color: '#3D1F1D'
  },
  reviewRating: {
    display: 'flex',
    gap: '2px'
  },
  reviewComment: {
    fontSize: '13px',
    color: '#4A3228',
    margin: '0 0 10px 0',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  reviewAuthor: {
    fontSize: '11px',
    color: '#7A6258',
    textAlign: 'right',
    fontWeight: '600'
  },
  joinSection: {
    width: '100%',
    margin: '35px 0 20px 0',
    display: 'flex',
    justifyContent: 'center'
  },
  joinBtn: {
    padding: '14px 32px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(61, 31, 29, 0.2)',
    transition: 'transform 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};

export default HomePage;