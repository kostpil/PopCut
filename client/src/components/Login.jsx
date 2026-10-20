import { useState } from 'react';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://moviebook-2-production.up.railway.app';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(''); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log-in. Please check your credentials.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setToastMessage('Log in successful!');

      setTimeout(() => {
        setToastMessage('');
        if (onLoginSuccess) {
          onLoginSuccess(data.user || formData);
        }
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <h3 style={styles.title}>Log-in</h3>
        
        {error && <p style={{ color: '#ff4d4d', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Log-in'}
          </button>
        </form>
      </div>

      {toastMessage && (
        <div style={styles.toast}>
          ✓ {toastMessage}
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    width: '100%',
    padding: '28px 24px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(61, 31, 29, 0.12)',
    backgroundColor: '#D8C0A8', 
    color: '#2C1A1D',
    textAlign: 'left',
    boxSizing: 'border-box',
    border: '2px solid #ddcfb7'
  },
  title: {
    color: '#3D1F1D',
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  errorText: {
    color: '#8B1E1B',
    backgroundColor: '#FADBD8',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '12px',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3D1F1D'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #BCA289',
    backgroundColor: '#FFFDF9', 
    color: '#2C1A1D',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3D1F1D', 
    color: '#FAF0E6',           
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  toast: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#3D1F1D',
    color: '#FAF0E6',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    border: '1px solid #D8C0A8',
    zIndex: 9999,
    pointerEvents: 'none',
    whiteSpace: 'nowrap'
  }
};

export default Login;