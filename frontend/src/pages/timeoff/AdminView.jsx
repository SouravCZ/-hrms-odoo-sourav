import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TimeOffTable from '../../components/timeoff/TimeOffTable';
import { getAllLeaveRequests, reviewLeaveRequest } from '../../services/api';

export default function AdminView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllLeaveRequests()
      .then(({ data }) => setRequests(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReview = async (id, status) => {
    try {
      await reviewLeaveRequest(id, status);
      toast.success(`Request ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update this request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Time Off</h1>
      </div>

      {loading ? (
        <div className="empty-state">Loading requests...</div>
      ) : (
        <TimeOffTable
          mode="admin"
          rows={requests}
          onApprove={(id) => handleReview(id, 'approved')}
          onReject={(id) => handleReview(id, 'rejected')}
        />
      )}
    </div>
  );
}
