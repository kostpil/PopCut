import { useState, useEffect } from 'react';
import logo from '../assets/popcut.png';
import filmStripImg from '../assets/film-strip.png';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/movies`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMovies(data);
        }
      })
      .catch((err) => console.error("Error fetching movies for film slider:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          setLatestReviews(data.slice(0, 4)); 
        }
      })
      .catch((err) => console.error("Error fetching latest reviews:", err));
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setFade(false); 
      
      setTimeout(() => {
        setStartIndex((prev) => (prev + 5) % movies.length); 
        setFade(true); 
      }, 500); 

    }, 4000); 

    return () => clearInterval(interval);
  }, [movies]);

  const visibleMovies = [];
  if (movies.length > 0) {
    for (let i = 0; i < 5; i++) {
      visibleMovies.push(movies[(startIndex + i) % movies.length]);
    }
  }

  return (
    <div style={styles.homeContainer}>
      <img src={logo} alt="PopCut Logo" style={styles.logo} />
      <div style={styles.tagline}>MOVIES · POP-CORN · OPINIONS</div>

      <div style={styles.sliderContainer}>
        <div style={styles.filmWrapper}>
          
          <div style={styles.postersOverlay}>
            {visibleMovies.length > 0 ? (
              visibleMovies.map((movie, index) => (
                <div key={index} style={styles.posterFrame}>
                  {movie?.poster_url ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      style={{
                        ...styles.posterImg,
                        opacity: fade ? 1 : 0 
                      }} 
                    />
                  ) : (
                    <div style={styles.placeholder}>{movie?.title || 'PopCut'}</div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: 'span 5', textAlign: 'center', color: '#7A6258', fontSize: '12px' }}>
                Loading film reel...
              </div>
            )}
          </div>

          <img src={filmStripImg} alt="Film Strip" style={styles.filmImage} />

        </div>
      </div>

      <div style={styles.feedContainer}>
        <h3 style={styles.feedTitle}>RECENT REVIEWS</h3>
        
        <div style={styles.reviewsGrid}>
          {latestReviews.length > 0 ? (
            latestReviews.map((review, index) => (
              <div key={index} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <span style={styles.movieTitle}>{review.movie_title || 'Movie'}</span>
                  <span style={styles.reviewRating}>⭐ {review.rating}/5</span>
                </div>
                <p style={styles.reviewComment}>"{review.comment || review.text}"</p>
                <span style={styles.reviewAuthor}>By: {review.username || 'User'}</span>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#7A6258', fontSize: '13px', padding: '20px 0' }}>
              Loading recent reviews...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  homeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '0 auto',
    textAlign: 'center',
    padding: '10px 0',
    boxSizing: 'border-box'
  },
  logo: {
    width: '350px',           
    height: 'auto',
    marginBottom: '1px',    
    display: 'block',        
    objectFit: 'contain'
  },
  tagline: {
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '2.5px',
    color: '#A84338',
    marginTop: '10px',
    marginBottom: '10px',    
    textTransform: 'uppercase'
  },
  sliderContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15px',       
    padding: '0 20px',
    boxSizing: 'border-box'
  },
  filmWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '920px',      
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filmImage: {
    width: '100%',
    height: 'auto',          
    display: 'block',
    zIndex: 2,
    pointerEvents: 'none'
  },
  postersOverlay: {
    position: 'absolute',
    top: '9.8%',              
    bottom: '14.0%',          
    left: '1.0%',             
    right: '0.5%',            
    display: 'flex',      
    justifyContent: 'space-between', 
    boxSizing: 'border-box',
    zIndex: 1,
    alignItems: 'center'
  },
  posterFrame: {
    width: '20.2%',          
    height: '100%',   
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '2px'
  },
  posterImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',          
    objectPosition: 'top center',
    borderRadius: '2px',
    transition: 'opacity 0.5s ease-in-out'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    textAlign: 'center'
  },
  feedContainer: {
    width: '100%',
    maxWidth: '920px', 
    margin: '40px auto 30px auto',
    padding: '0 20px',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  feedTitle: {
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#A84338',       
    marginBottom: '15px',
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
    backgroundColor: '#FAF0E6',             
    border: '1px solid #D5C2B4',
    borderRadius: '6px',
    padding: '15px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  movieTitle: {
    fontWeight: '700',
    fontSize: '13px',
    color: '#A84338'
  },
  reviewRating: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#3D1F1D'
  },
  reviewComment: {
    fontSize: '13px',
    color: '#4A3B32',
    margin: '0 0 10px 0',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  reviewAuthor: {
    fontSize: '11px',
    color: '#7A6258',
    textAlign: 'right'
  }
};

export default HomePage;