import { useState } from 'react';
import MovieSearchModal from './MovieSearchModal';

function Profile({ user, onLogout }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

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
        🔍 Search Movies
      </button>

      <button onClick={onLogout} style={styles.logoutBtn}>
        Logout
      </button>

      <MovieSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '400px',
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
  avatarContainer: {
    marginBottom: '20px'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#646cff', 
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
    marginBottom: '24px'
  },
  infoText: {
    margin: 0,
    fontSize: '15px',
    color: '#e0e0e0'
  },
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
    marginBottom: '12px'
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