import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import logo from './assets/popcut.png';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setActiveTab('profile');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsLogin(true);
    setActiveTab('login');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab === 'login') {
      setIsLogin(true);
    } else if (tab === 'register') {
      setIsLogin(false);
    }
  };

  return (
    <div style={styles.mainWrapper}>
      <Header 
        user={user} 
        activeTab={activeTab} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />

      <div style={styles.appContainer}>
        <img src={logo} alt="PopCut Logo" style={styles.logo} />

        {user ? (
          <Profile user={user} onLogout={handleLogout} />
        ) : isLogin ? (
          <div style={styles.cardWrapper}>
            <Login onLoginSuccess={handleLoginSuccess} />
            <p style={styles.text}>
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  setIsLogin(false);
                  setActiveTab('register');
                }} 
                style={styles.toggleBtn}
              >
                Register
              </button>
            </p>
          </div>
        ) : (
          <div style={styles.cardWrapper}>
            <Register 
              onSwitchToLogin={() => {
                setIsLogin(true);
                setActiveTab('login');
              }} 
            />
          </div>
        )}

        <footer style={styles.footer}>
          <p style={styles.footerText}>© Built by Haralambos Ktenidis & Kostas Pilateris | PopCut 2026</p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  mainWrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#FAF0E6',
    display: 'flex',
    flexDirection: 'column'
  },
  appContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    padding: '3px'
  },
  logo: {
    width: '350px',           
    height: 'auto',
    marginTop: '5px',         
    marginBottom: '10px',     
    display: 'block',         
    marginLeft: '60px',        
    marginRight: '40px',      
    objectFit: 'contain'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  text: {
    marginTop: '16px',
    color: '#2C1A1D',
    fontSize: '14px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#3D1F1D',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: 0
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '0px',
    paddingBottom: '0px',
    textAlign: 'center',
    width: '100%'
  },
  footerText: {
    margin: 0,
    color: '#2C1A1D',
    fontSize: '13px'
  }
};

export default App;