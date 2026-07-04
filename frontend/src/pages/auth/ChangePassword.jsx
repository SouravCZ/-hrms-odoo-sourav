import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { changePassword } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function ChangePassword() {
  const { clearForcePasswordFlag } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      clearForcePasswordFlag();
      toast.success('Password updated successfully');
      navigate('/employees');
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not update password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Card className="card-center">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="navbar-logo" style={{ margin: '0 auto 10px', width: 48, height: 48 }}>
            <Users size={24} color="#fff" />
          </div>
          <h2 style={{ margin: '0 0 6px 0' }}>Set Your New Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            This is your first login. Please set a new password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label>New Password</label>
            <div className="field-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" block disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
