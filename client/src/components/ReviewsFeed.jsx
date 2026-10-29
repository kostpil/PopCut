import { useState, useEffect } from 'react';
import logo from '../assets/popcut.png';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function ReviewsFeed({ onNavigateToSearch, onNavigateToAuth, onNavigateToProfile }) {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [activeItem, setActiveItem] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [countsMap, setCountsMap] = useState({});

  const itemsPerPage = 6; 

  const fetchFeed = async () => {
    setLoading(true);
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

      items = items.map(item => {
        const id = item._id || item.id;
        const finalDate = item.watchedAt || item.createdAt;

        let updatedItem = {
          ...item,
          rawDate: finalDate
        };

        if (localEdits[id]) {
          updatedItem.rating = localEdits[id].rating !== undefined ? localEdits[id].rating : updatedItem.rating;
          updatedItem.review = localEdits[id].review !== undefined ? localEdits[id].review : updatedItem.review;
        }

        return updatedItem;
      });

      items.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

      setFeedItems(items);
      setLoading(false);

      items.forEach(item => {
        const id = item._id || item.id;
        fetch(`${API_BASE_URL}/api/watched/${id}/comments`)
          .then(r => r.ok ? r.json() : [])
          .then(comments => {
            const len = Array.isArray(comments) ? comments.length : 0;
            setCountsMap(prev => ({ ...prev, [id]: len }));
          })
          .catch(() => {});
      });
    } catch (err) {
      console.error("Error fetching community feed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const handleFocus = () => fetchFeed();
    const handleUpdate = () => fetchFeed();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('watched_updated', handleUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('watched_updated', handleUpdate);
    };
  }, []);

  const fetchComments = async (watchedId) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/watched/${watchedId}/comments`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setCommentsList(list);
        setCountsMap(prev => ({ ...prev, [watchedId]: list.length }));
        setLoadingComments(false);
        return list;
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
    setLoadingComments(false);
    return [];
  };

  const openCommentsModal = async (item) => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      setShowAuthModal(true);
      return;
    }

    setActiveItem(item);
    setCommentInput('');
    const watchedId = item._id || item.id;
    await fetchComments(watchedId);
  };

  const closeCommentsModal = () => {
    setActiveItem(null);
    setCommentsList([]);
    setCommentInput('');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      setShowAuthModal(true);
      return;
    }

    const text = commentInput.trim();
    if (!text) return;

    const watchedId = activeItem._id || activeItem.id;

    try {
      const res = await fetch(`${API_BASE_URL}/api/watched/${watchedId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: text })
      });

      if (res.ok) {
        setCommentInput('');
        await fetchComments(watchedId);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleAddReviewClick = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) {
      setShowAuthModal(true);
      return;
    }
    if (onNavigateToSearch) onNavigateToSearch();
  };

  const handleProfileNavigation = (userObjOrId) => {
    if (!onNavigateToProfile || !userObjOrId) return;
    onNavigateToProfile(userObjOrId);
  };

  const totalPages = Math.ceil(feedItems.length / itemsPerPage);
  const currentItems = feedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#B87333' : '#C4A88E', fontSize: '15px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Community Feed</h2>
        <button onClick={handleAddReviewClick} style={styles.addReviewBtn}>
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
              const watchedId = item._id || item.id;
              const username = item.user_id?.username || item.user_id?.email || 'Anonymous';
              const authorData = item.user_id;
              const movie = item.movie_id || {};
              const commentCount = countsMap[watchedId] !== undefined ? countsMap[watchedId] : (item.commentsCount || 0);

              return (
                <div key={watchedId} style={styles.card}>
                  <div style={styles.posterWrapper}>
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} style={styles.posterImg} />
                    ) : (
                      <div style={styles.posterPlaceholder}>No Poster</div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.userRow}>
                      <div style={styles.avatarCircle}>{username.charAt(0).toUpperCase()}</div>
                      <div style={styles.userMeta}>
                        <span 
                          style={{ ...styles.userEmail, cursor: 'pointer', textDecoration: 'underline' }} 
                          title={username}
                          onClick={() => handleProfileNavigation(authorData)}
                        >
                          {username}
                        </span>
                        <small style={styles.dateText}>{formatDateTime(item.rawDate)}</small>
                      </div>
                    </div>

                    <div style={styles.movieHeader}>
                      <span style={styles.movieTitle}>
                        {movie.title || 'Unknown Movie'} {movie.year ? `(${movie.year})` : ''}
                      </span>
                    </div>

                    <div style={styles.ratingBox}>{renderStars(item.rating)}</div>
                    {item.review && <p style={styles.reviewText}>"{item.review}"</p>}

                    <button onClick={() => openCommentsModal(item)} style={styles.commentsToggleBtn}>
                      💬 Comments ({commentCount})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1} 
                style={styles.pageBtn}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                style={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {activeItem && (() => {
        const movie = activeItem.movie_id || {};
        const username = activeItem.user_id?.username || activeItem.user_id?.email || 'Anonymous';
        const authorData = activeItem.user_id;

        return (
          <div style={styles.modalOverlay}>
            <div style={styles.commentModalContent}>
              <div style={styles.modalHeaderRow}>
                <h3 style={styles.modalHeading}>Discussion & Comments</h3>
                <button onClick={closeCommentsModal} style={styles.modalCloseX}>×</button>
              </div>

              <div style={styles.modalReviewCard}>
                <div style={styles.posterWrapper}>
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} style={styles.posterImg} />
                  ) : (
                    <div style={styles.posterPlaceholder}>No Poster</div>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.userRow}>
                    <div style={styles.avatarCircle}>{username.charAt(0).toUpperCase()}</div>
                    <div style={styles.userMeta}>
                      <span 
                        style={{ ...styles.userEmail, cursor: 'pointer', textDecoration: 'underline' }} 
                        title={username}
                        onClick={() => handleProfileNavigation(authorData)}
                      >
                        {username}
                      </span>
                      <small style={styles.dateText}>{formatDateTime(activeItem.rawDate)}</small>
                    </div>
                  </div>
                  <div style={styles.movieHeader}>
                    <span style={styles.movieTitle}>
                      {movie.title || 'Unknown Movie'} {movie.year ? `(${movie.year})` : ''}
                    </span>
                  </div>
                  <div style={styles.ratingBox}>{renderStars(activeItem.rating)}</div>
                  {activeItem.review && <p style={styles.reviewText}>"{activeItem.review}"</p>}
                </div>
              </div>

              <div style={styles.modalCommentsSection}>
                {loadingComments ? (
                  <p style={styles.commentStatus}>Loading comments...</p>
                ) : commentsList.length === 0 ? (
                  <p style={styles.commentStatus}>No comments yet. Be the first to reply!</p>
                ) : (
                  <div style={styles.commentsList}>
                    {commentsList.map((c, idx) => {
                      const commenterName = c.commenter_id?.username || c.commenter_id?.email || 'User';
                      const commenterData = c.commenter_id;

                      return (
                        <div key={idx} style={styles.commentItem}>
                          <strong 
                            style={{ ...styles.commenterName, cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleProfileNavigation(commenterData)}
                          >
                            {commenterName}:
                          </strong>
                          <span style={styles.commentText}>{c.comment}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleAddComment} style={styles.commentForm}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    style={styles.commentInput}
                  />
                  <button type="submit" style={styles.commentSubmitBtn}>Post</button>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.authModalContent}>
            <h3 style={styles.authModalTitle}>Authentication Required</h3>
            <p style={styles.modalText}>
              You need to have an account for this action. Please log in or register!
            </p>
            <div style={styles.modalBtnGroup}>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  if (onNavigateToAuth) onNavigateToAuth('login');
                }} 
                style={styles.modalLoginBtn}
              >
                Log-in
              </button>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  if (onNavigateToAuth) onNavigateToAuth('register');
                }} 
                style={styles.modalRegisterBtn}
              >
                Register
              </button>
              <button 
                onClick={() => setShowAuthModal(false)} 
                style={styles.modalCloseBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
  commentsToggleBtn: {
    marginTop: '6px',
    background: 'none',
    border: '1px solid #C4A88E',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    cursor: 'pointer',
    alignSelf: 'flex-start'
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
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  pageInfo: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  commentModalContent: {
    backgroundColor: '#FAF0E6',
    padding: '25px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '550px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '2px solid #C4A88E',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box'
  },
  authModalContent: {
    backgroundColor: '#FAF0E6',
    padding: '30px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    border: '2px solid #C4A88E',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box'
  },
  modalHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  modalHeading: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  modalCloseX: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    cursor: 'pointer'
  },
  modalReviewCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #D8C0A8',
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginBottom: '15px'
  },
  modalCommentsSection: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #D8C0A8',
    borderRadius: '12px',
    padding: '15px'
  },
  commentStatus: {
    fontSize: '13px',
    color: '#7A6258',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '10px 0'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    marginBottom: '15px'
  },
  commentItem: {
    fontSize: '13px',
    color: '#2C1A1D',
    backgroundColor: '#FAF0E6',
    padding: '8px 10px',
    borderRadius: '8px'
  },
  commenterName: {
    color: '#3D1F1D',
    marginRight: '6px'
  },
  commentText: {
    color: '#4A3228'
  },
  commentForm: {
    display: 'flex',
    gap: '8px'
  },
  commentInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #C4A88E',
    backgroundColor: '#FFFDF9',
    color: '#2C1A1D',
    fontSize: '13px',
    outline: 'none'
  },
  commentSubmitBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  authModalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#3D1F1D',
    margin: '0 0 12px 0'
  },
  modalText: {
    fontSize: '14px',
    color: '#5C433E',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  modalBtnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  modalLoginBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalRegisterBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #3D1F1D',
    backgroundColor: '#FFFDF9',
    color: '#3D1F1D',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalCloseBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#7A6258',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '5px'
  }
};

export default ReviewsFeed;