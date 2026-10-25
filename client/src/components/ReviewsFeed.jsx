import { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function ReviewsFeed({ onNavigateToSearch }) {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const fetchFeed = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/watched/feed`)
      .then((res) => {
        if (!res.ok) {
          return fetch(`${API_BASE_URL}/api/feed`).then(r => r.ok ? r.json() : []);
        }
        return res.json();
      })
      .then((data) => {
        setFeedItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching community feed:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeed();
    const handleFocus = () => fetchFeed();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const totalPages = Math.ceil(feedItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = feedItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const dateFormatted = d.toLocaleDateString();
    const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateFormatted} • ${timeFormatted}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Community Feed</h2>
        <button onClick={onNavigateToSearch} style={styles.addReviewBtn}>
          + Add Review
        </button>
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading reviews...</p>
      ) : feedItems.length === 0 ? (
        <p style={styles.emptyText}>No reviews shared yet. Be the first to add one!</p>
      ) : (
        <>
          <div style={styles.feedGrid}>
            {currentItems.map((item) => {
              const userEmail = item.user_id?.email || item.user_id?.username || 'Anonymous';
              const initialLetter = userEmail.charAt(0).toUpperCase();
              const movie = item.movie_id || {};

              return (
                <div key={item._id || item.id} style={styles.card}>
                  <div style={styles.posterWrapper}>
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} style={styles.posterImg} />
                    ) : (
                      <div style={styles.posterPlaceholder}>No Poster</div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.userRow}>
                      <div style={styles.avatarCircle}>{initialLetter}</div>
                      <div style={styles.userMeta}>
                        <span style={styles.userEmail} title={userEmail}>{userEmail}</span>
                        <small style={styles.dateText}>
                          {formatDateTime(item.watchedAt || item.createdAt)}
                        </small>
                      </div>
                    </div>

                    <div style={styles.movieHeader}>
                      <span style={styles.movieTitle} title={movie.title}>
                        {movie.title || 'Unknown Movie'} {movie.year ? `(${movie.year})` : ''}
                      </span>
                    </div>

                    <div style={styles.ratingBox}>
                      {renderStars(item.rating)}
                    </div>

                    {item.review && (
                      <p style={styles.reviewText}>"{item.review}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1140px',
    margin: '25px auto',
    padding: '28px',
    borderRadius: '18px',
    boxShadow: '0 10px 28px rgba(61, 31, 29, 0.1)',
    backgroundColor: '#FAF0E6',
    color: '#2C1A1D',
    boxSizing: 'border-box',
    textAlign: 'left',
    border: '1px solid #EAD7C5'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
    borderBottom: '2px solid #EAD7C5',
    paddingBottom: '14px'
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  addReviewBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(61, 31, 29, 0.15)'
  },
  loadingText: {
    textAlign: 'center',
    color: '#5C433E',
    fontStyle: 'italic',
    padding: '40px 0'
  },
  emptyText: {
    textAlign: 'center',
    color: '#5C433E',
    fontStyle: 'italic',
    padding: '40px 0'
  },
  feedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px'
  },
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: '14px',
    padding: '14px',
    border: '1px solid #D8C0A8',
    display: 'flex',
    flexDirection: 'row',
    gap: '14px',
    alignItems: 'flex-start', 
    boxShadow: '0 3px 10px rgba(61, 31, 29, 0.06)',
    boxSizing: 'border-box'
  },
  posterWrapper: {
    width: '110px',
    height: '155px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF0E6',
    flexShrink: 0
  },
  posterImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block'
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EAD7C5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A6258',
    fontSize: '11px',
    textAlign: 'center',
    padding: '4px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    flex: 1,
    overflow: 'hidden'
  },
  userRow: {
    display: 'flex',
    alignItems: 'flex-start',  
    gap: '8px'
  },
  avatarCircle: {
    width: '26px', 
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    flexShrink: 0,
    marginTop: '1px' 
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userEmail: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.2'
  },
  dateText: {
    fontSize: '10px',
    color: '#7A6258',
    marginTop: '1px'
  },
  movieHeader: {
    marginTop: '2px'
  },
  movieTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center'
  },
  reviewText: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#4A3228',
    fontStyle: 'italic',
    lineHeight: '1.35',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '28px',
    paddingTop: '16px',
    borderTop: '1px solid #EAD7C5'
  },
  pageBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  pageInfo: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  }
};

export default ReviewsFeed;