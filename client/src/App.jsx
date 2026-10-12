import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import logo from './assets/MovieBook logo.png';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div style={styles.appContainer}>
      <img src={logo} alt="MovieBook Logo" style={styles.logo} />

      {user ? (
        <Profile user={user} onLogout={handleLogout} />
      ) : isLogin ? (
        <div style={styles.cardWrapper}>
          <Login onLoginSuccess={handleLoginSuccess} />
          <p style={styles.text}>
            Don't have an account?{' '}
            <button 
              onClick={() => setIsLogin(false)} 
              style={styles.toggleBtn}
            >
              Register
            </button>
          </p>
        </div>
      ) : (
        <div style={styles.cardWrapper}>
          <Register onLoginSuccess={handleLoginSuccess} />
          <p style={styles.text}>
            Already have an account?{' '}
            <button 
              onClick={() => setIsLogin(true)} 
              style={styles.toggleBtn}
            >
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px'
  },
  logo: {
    width: '570px',
    height: 'auto',
    marginBottom: '1px',
    objectFit: 'contain'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  text: {
    marginTop: '16px',
    color: '#ccc',
    fontSize: '14px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#646cff',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: 0
  }
};

export default App;