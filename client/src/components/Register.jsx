import { useState } from 'react';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 || response.status === 409 || (data.message && data.message.toLowerCase().includes('exist'))) {
          throw new Error('A user with that email already exists. Please try a different email.');
        }
        throw new Error(data.message || 'Failed to register. Please try again later.');
      }

      alert('Registration successful!');

      if (onRegisterSuccess) {
        onRegisterSuccess(data);
      }

      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ color: '#646cff' }}>Register</h3>      
      
      {error && <p style={{ color: '#ff4d4d', marginBottom: '10px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="120"
            required
            style={styles.input}
          />
        </div>

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
          Register
        </button>
      </form>

      {/* Koumpi gia xeirokiniti metafora sto Login an o xristis exei idi logariasmo */}
      {onSwitchToLogin && (
        <p style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            Log in here
          </span>
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    textAlign: 'left',
    boxSizing: 'border-box'
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
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2b2b2b',
    color: '#fff',
    fontSize: '14px'
  },
  button: {
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#646cff',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  }
};

export default Register;