import { useState, useMemo } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { submitLeaveRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  const days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
}

export default function TimeOffRequestModal({ onClose, onSubmitted }) {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allocation = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);

  const handleSubmit = async () => {
    setError('');
    if (!leaveType || !startDate || !endDate) {
      setError('Please fill in the leave type and date range.');
      return;
    }

    const formData = new FormData();
    formData.append('leaveType', leaveType);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('remarks', remarks);
    if (file) formData.append('attachment', file);

    setSubmitting(true);
    try {
      await submitLeaveRequest(formData);
      toast.success('Leave request submitted');
      onSubmitted();
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not submit the request.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Time Off Request"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Discard</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      }
    >
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label>Employee</label>
        <input value={user?.name || ''} readOnly />
      </div>

      <div className="field">
        <label>Time Off Type</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
          <option value="">Select type</option>
          <option value="paid">Paid Time Off</option>
          <option value="sick">Sick Leave</option>
          <option value="unpaid">Unpaid Leave</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="field">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Allocation (Days)</label>
        <input value={allocation ? `${allocation} (auto-calculated)` : '0 (auto-calculated)'} readOnly />
      </div>

      <div className="field">
        <label>Remarks</label>
        <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </div>

      <div className="field">
        <label>Attachment</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('attachment-input').click()}
        >
          <Upload size={14} /> {file ? file.name : 'Upload File'}
        </Button>
        <input
          id="attachment-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="field-hint">For sick leave certificate</div>
      </div>
    </Modal>
  );
}
