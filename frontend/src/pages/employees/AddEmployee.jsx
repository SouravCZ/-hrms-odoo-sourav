import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createEmployee } from '../../services/api';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', jobTitle: '', joiningDate: '',
  });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await createEmployee(form);
      setResult(data);
      toast.success('Employee created successfully');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Could not create employee';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Employee Created</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Share these credentials with {result.employee.first_name} directly — they'll be asked
          to set their own password on first login.
        </p>
        <div className="field">
          <label>Login ID</label>
          <input value={result.employee.employee_code} readOnly />
        </div>
        <div className="field">
          <label>Temporary Password</label>
          <input value={result.tempPassword} readOnly />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => navigate('/employees')}>Back to Employees</Button>
          <Button variant="outline" onClick={() => { setResult(null); setForm({ firstName: '', lastName: '', email: '', phone: '', department: '', jobTitle: '', joiningDate: '' }); }}>
            Add Another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 560, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>First Name</label>
            <input value={form.firstName} onChange={update('firstName')} placeholder="Enter first name" required />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input value={form.lastName} onChange={update('lastName')} placeholder="Enter last name" required />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="Enter email address" required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={update('phone')} placeholder="Enter phone number" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Department</label>
            <input value={form.department} onChange={update('department')} placeholder="e.g. Engineering" />
          </div>
          <div className="field">
            <label>Job Title</label>
            <input value={form.jobTitle} onChange={update('jobTitle')} placeholder="Enter job title" />
          </div>
        </div>

        <div className="field">
          <label>Joining Date</label>
          <input type="date" value={form.joiningDate} onChange={update('joiningDate')} />
        </div>

        <div className="field-hint" style={{ marginBottom: 16 }}>
          Login ID and temporary password will be auto-generated
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" type="button" onClick={() => navigate('/employees')}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</Button>
        </div>
      </form>
    </Card>
  );
}
