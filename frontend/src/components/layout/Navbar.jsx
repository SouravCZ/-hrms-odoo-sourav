import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Users, LogOut, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import { checkIn, checkOut, getMyTodayAttendance } from '../../services/api';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const tabs = [
    ...(isAdmin ? [{ label: 'Employees', path: '/employees' }] : []),
    { label: 'Attendance', path: '/attendance' },
    { label: 'Time Off', path: '/timeoff' },
  ];

  useEffect(() => {
    if (!isAdmin) {
      getMyTodayAttendance()
        .then(({ data }) => setAttendanceStatus(data))
        .catch(() => setAttendanceStatus(null));
    }
  }, [isAdmin]);

  const handleCheckIn = async () => {
    setLoadingAttendance(true);
    try {
      await checkIn();
      toast.success('Checked in successfully');
      const { data } = await getMyTodayAttendance();
      setAttendanceStatus(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not check in');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingAttendance(true);
    try {
      await checkOut();
      toast.success('Checked out successfully');
      const { data } = await getMyTodayAttendance();
      setAttendanceStatus(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not check out');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/signin');
  };

  const [firstName = '', lastName = ''] = (user?.name || '').split(' ');
  const hasCheckedIn = attendanceStatus?.check_in && !attendanceStatus?.check_out;
  const hasCheckedOut = attendanceStatus?.check_in && attendanceStatus?.check_out;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/employees" className="navbar-brand">
          <span className="navbar-logo">
            <Users size={18} color="#fff" />
          </span>
          HRMS
        </Link>
        <div className="navbar-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`navbar-tab ${location.pathname.startsWith(tab.path) ? 'active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        {!isAdmin && (
          <div className="navbar-checkin-btns">
            {hasCheckedOut ? (
              <button
                className="btn btn-sm navbar-checkin-btn btn-checkout"
                disabled={loadingAttendance}
              >
                <LogOutIcon size={14} />
                Checked Out
              </button>
            ) : hasCheckedIn ? (
              <button
                className="btn btn-sm navbar-checkin-btn btn-checkin-active"
                onClick={handleCheckOut}
                disabled={loadingAttendance}
              >
                <LogOutIcon size={14} />
                {loadingAttendance ? 'Processing...' : 'Check Out'}
              </button>
            ) : (
              <button
                className="btn btn-sm navbar-checkin-btn btn-checkin"
                onClick={handleCheckIn}
                disabled={loadingAttendance}
              >
                <LogIn size={14} />
                {loadingAttendance ? 'Processing...' : 'Check In'}
              </button>
            )}
          </div>
        )}
        <div onClick={() => setMenuOpen((v) => !v)} style={{ cursor: 'pointer' }}>
          <Avatar firstName={firstName} lastName={lastName} status="present" size="sm" />
        </div>
        {menuOpen && (
          <div className="avatar-dropdown" onMouseLeave={() => setMenuOpen(false)}>
            <div
              className="avatar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate('/profile');
              }}
            >
              My Profile
            </div>
            <div className="avatar-dropdown-item" onClick={handleLogout}>
              <LogOut size={14} /> Log Out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
