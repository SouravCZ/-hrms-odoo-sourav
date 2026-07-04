import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(identifier, password);
      toast.success('Signed in successfully');
      navigate('/employees');
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid login ID/email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Card className="card-center">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="navbar-logo" style={{ margin: '0 auto 10px', width: 48, height: 48 }}>
            <Users size={24} color="#fff" />
          </div>
          <h2 style={{ color: 'var(--accent)', margin: 0 }}>HRMS</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label>Login ID or Email</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your login ID or email"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="field-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" block disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="helper-text">
          Don't have an account? <Link to="/signup" className="link-accent">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
}
