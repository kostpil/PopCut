import { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Registration successful!');
  };

  return (
    <div style={styles.container}>
        <h3 style={{ color: '#646cff' }}>Register</h3>      
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

        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
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