import React, { useState, useEffect } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function MovieDetailModal({ isOpen, onClose, movieId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 useEffect(() => {
  if (isOpen && movieId) {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    fetch(`${API_BASE_URL}/api/watched/${movieId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch movie details.');
        return res.json();
      })
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error details:", err);
        setError('Could not load movie details.');
        setLoading(false);
      });
  }
}, [isOpen, movieId]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        {loading && <p style={{ textAlign: 'center', color: '#3D1F1D' }}>Loading movie details...</p>}
        {error && <p style={{ textAlign: 'center', color: '#A84338' }}>{error}</p>}

        {!loading && !error && details && (
          <div>
            <h3 style={styles.title}>{details.title}</h3>

            <div style={styles.content}>
              {details.poster_url ? (
                <img src={details.poster_url} alt={details.title} style={styles.poster} />
              ) : (
                <div style={styles.posterPlaceholder}>No Poster</div>
              )}

              <div style={styles.info}>
                {(details.year || details.release_year) && (
                  <p style={styles.text}><strong>Year:</strong> {details.year || details.release_year}</p>
                )}
                
                {details.genre && (
                  <p style={styles.text}>
                    <strong>Genre:</strong> {Array.isArray(details.genre) ? details.genre.join(', ') : details.genre}
                  </p>
                )}

                {details.description && (
                  <p style={styles.text}><strong>Description:</strong> {details.description}</p>
                )}
              </div>
            </div>
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
    backgroundColor: 'rgba(61, 31, 29, 0.35)',
    backdropFilter: 'blur(3px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#f6d7bb',
    border: '2px solid #C4A88E',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '550px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    color: '#2C1A1D',
    boxShadow: '0 8px 25px rgba(44, 26, 29, 0.25)'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: '#D8C0A8',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3D1F1D',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  title: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3D1F1D'
  },
  content: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },
  poster: {
    width: '130px',
    height: '190px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #C4A88E'
  },
  posterPlaceholder: {
    width: '130px',
    height: '190px',
    backgroundColor: '#EAD7C5',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7A6258',
    fontSize: '12px'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
    flex: 1
  },
  text: {
    margin: 0,
    fontSize: '14px',
    color: '#2C1A1D',
    lineHeight: '1.4'
  }
};

export default MovieDetailModal;