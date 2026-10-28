import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import MovieSearchModal from './components/MovieSearchModal';
import ReviewsFeed from './components/ReviewsFeed'; 
import HomePage from './components/HomePage'; 
import logo from './assets/popcut.png';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [viewingUserId, setViewingUserId] = useState(null); // ID άλλου χρήστη για δημόσιο προφίλ
  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setViewingUserId(null);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    setUser(null);
    setViewingUserId(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLogin(true);
    setActiveTab('login');
  };

  const handleNavigate = (tab) => {
    // Μηδενίζουμε το viewingUserId για ΟΛΑ τα tabs που πατάμε από το Header!
    setViewingUserId(null); 
    
    setActiveTab(tab);
    if (tab === 'login') setIsLogin(true);
    if (tab === 'register') setIsLogin(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleNavigateToAuth = (type) => {
    setViewingUserId(null);
    setActiveTab(type);
    setIsLogin(type === 'login');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Συνάρτηση για μετάβαση στο δημόσιο προφίλ άλλου χρήστη
  const handleNavigateToProfile = (userId) => {
    setViewingUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleAddWatchedMovie = (newMovie) => {
    const userEmail = user?.email || 'default';
    const savedMovies = localStorage.getItem(`watchedMovies_${userEmail}`);
    let currentMovies = [];
    if (savedMovies) {
      try { currentMovies = JSON.parse(savedMovies); } catch (err) { console.error(err); }
    }
    const updatedMovies = [newMovie, ...currentMovies];
    localStorage.setItem(`watchedMovies_${userEmail}`, JSON.stringify(updatedMovies));
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
        {activeTab === 'search' ? (
          <MovieSearchModal 
            onAddWatchedMovie={handleAddWatchedMovie} 
            onNavigateToAuth={handleNavigateToAuth} 
          />
        ) : activeTab === 'reviews' ? (
          <ReviewsFeed 
            onNavigateToSearch={() => handleNavigate('search')} 
            onNavigateToAuth={handleNavigateToAuth}
            onNavigateToProfile={handleNavigateToProfile}
          />
        ) : activeTab === 'home' ? (
          <HomePage user={user} onNavigateToAuth={handleNavigateToAuth} /> 
        ) : activeTab === 'profile' ? (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            profileUserId={viewingUserId} 
          />
        ) : activeTab === 'login' ? (
          <div style={styles.cardWrapper}>
            <img src={logo} alt="PopCut Logo" style={styles.logoAuth} />
            <Login onLoginSuccess={handleLoginSuccess} />
            <p style={styles.text}>
              Don't have an account?{' '}
              <button onClick={() => handleNavigateToAuth('register')} style={styles.toggleBtn}>
                Register
              </button>
            </p>
          </div>
        ) : activeTab === 'register' ? (
          <div style={styles.cardWrapper}>
            <img src={logo} alt="PopCut Logo" style={styles.logoAuth} />
            <Register onSwitchToLogin={() => handleNavigateToAuth('login')} />
          </div>
        ) : null}

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
    padding: '20px 0', 
    overflowX: 'hidden' 
  },
  logoAuth: {
    width: '260px',            
    height: 'auto',
    marginTop: '5px',        
    marginBottom: '10px',    
    display: 'block',        
    marginLeft: 'auto',        
    marginRight: 'auto',      
    objectFit: 'contain'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '450px',
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
    paddingTop: '20px',
    paddingBottom: '10px',
    textAlign: 'center',
    width: '100%'
  },
  footerText: {
    margin: 0,
    color: '#7A6258',
    fontSize: '13px'
  }
};

export default App;