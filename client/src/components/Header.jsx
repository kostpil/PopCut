import logo from '../assets/popcut.png';

function Header({ user, onNavigate, onLogout, activeTab }) {
  const handleNav = (tab) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <>
      <style>
        {`
          .popcut-nav-btn {
            background: transparent;
            border: 1px solid rgba(61, 31, 29, 0.4);
            border-radius: 4px;
            color: #3D1F1D !important; 
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 0.5px;
            cursor: pointer;
            padding: 7px 16px;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            outline: none;
            box-shadow: none;
          }
          .popcut-nav-btn:hover,
          .popcut-nav-btn.active {
            background-color: #FFFDF9 !important; 
            border-color: #3D1F1D !important;
            color: #3D1F1D !important;         
            font-weight: 600;
          }
          .popcut-logout-btn {
            background-color: #A84338;          
            border: 1px solid #A84338;
            border-radius: 4px;
            color: #FAF0E6 !important;          
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.5px;
            cursor: pointer;
            padding: 7px 16px;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            outline: none;
            box-shadow: none;
          }
          .popcut-logout-btn:hover {
            background-color: #8B352C;         
            border-color: #8B352C;
            color: #FAF0E6 !important;
          }
        `}
      </style>
      
      <header style={styles.header}>
        <div style={styles.leftGroup}>
          <img 
            src={logo} 
            alt="PopCut Logo" 
            style={styles.logo}
            onClick={() => handleNav('home')} 
          />
          <div style={styles.navGroup}>
            <button 
              onClick={() => handleNav('home')} 
              className={`popcut-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>

            <button 
              onClick={() => handleNav('search')} 
              className={`popcut-nav-btn ${activeTab === 'search' ? 'active' : ''}`}
            >
              Search
            </button>

            <button 
              onClick={() => handleNav('reviews')} 
              className={`popcut-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              Reviews
            </button>
          </div>
        </div>

        <div style={styles.userGroup}>
          {user ? (
            <>
              <button 
                onClick={() => handleNav('profile')} 
                className={`popcut-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                Profile
              </button>
              <button onClick={onLogout} className="popcut-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleNav('login')} 
                className={`popcut-nav-btn ${activeTab === 'login' ? 'active' : ''}`}
              >
                Log-in
              </button>
              <button 
                onClick={() => handleNav('register')} 
                className={`popcut-nav-btn ${activeTab === 'register' ? 'active' : ''}`}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}

const styles = {
  header: {
    width: '100%',
    height: '56px',
    backgroundColor: '#D8C0A8',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(61, 31, 29, 0.12)',
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 900,
    boxSizing: 'border-box'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    height: '52px',
    width: 'auto',
    cursor: 'pointer',
    objectFit: 'contain',
    marginLeft: '0px',
    marginRight: '8px'
  }
};

export default Header;