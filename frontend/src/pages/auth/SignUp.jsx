import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { signupCompany } from '../../services/api';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', adminName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signupCompany({
        companyName: form.companyName,
        adminName: form.adminName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate('/signin');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Could not create the account';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Card className="card-center" style={{ maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="navbar-logo" style={{ margin: '0 auto 10px', width: 48, height: 48 }}>
            <Users size={24} color="#fff" />
          </div>
          <h2 style={{ color: 'var(--accent)', margin: 0 }}>HRMS</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label>Company Name</label>
            <input value={form.companyName} onChange={update('companyName')} required />
          </div>
          <div className="field">
            <label>Name</label>
            <input value={form.adminName} onChange={update('adminName')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={update('phone')} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required minLength={8} />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required />
          </div>

          <Button type="submit" block disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="helper-text">
          Already have an account? <Link to="/signin" className="link-accent">Sign In</Link>
        </div>
      </Card>
    </div>
  );
}
