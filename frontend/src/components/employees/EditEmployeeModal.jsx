import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateEmployee } from '../../services/api';

export default function EditEmployeeModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: employee.first_name || '',
    lastName: employee.last_name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    jobTitle: employee.job_title || '',
    joiningDate: employee.joining_date ? employee.joining_date.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateEmployee(employee.id, form);
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Could not update employee';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Edit Employee" boxClassName="modal-wide">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>First Name</label>
            <input value={form.firstName} onChange={update('firstName')} required />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input value={form.lastName} onChange={update('lastName')} required />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={update('phone')} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Department</label>
            <input value={form.department} onChange={update('department')} />
          </div>
          <div className="field">
            <label>Job Title</label>
            <input value={form.jobTitle} onChange={update('jobTitle')} />
          </div>
        </div>

        <div className="field">
          <label>Joining Date</label>
          <input type="date" value={form.joiningDate} onChange={update('joiningDate')} />
        </div>

        <div className="modal-footer">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Modal>
  );
}
