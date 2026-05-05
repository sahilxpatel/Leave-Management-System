import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

type Message = { type: 'success' | 'error'; text: string };

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/login', { email, password });
      const { token, role, name, leaveBalance } = response.data as {
        token: string;
        role: 'ADMIN' | 'EMPLOYEE';
        name: string;
        leaveBalance: number;
      };

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('leaveBalance', String(leaveBalance ?? 0));

      navigate(role === 'ADMIN' ? '/admin' : '/employee');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card narrow">
      <h1 className="section-title">Welcome back</h1>
      <p className="muted">Sign in to manage leave requests.</p>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label className="label" htmlFor="password" style={{ marginTop: '16px' }}>Password</label>
        <input
          id="password"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          required
        />

        <div style={{ marginTop: '20px' }}>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
