import { Check, X, Paperclip } from 'lucide-react';
import Avatar from '../ui/Avatar';
import StatusPill from '../ui/StatusPill';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL;

function leaveTypeLabel(type) {
  if (type === 'paid') return 'Paid Time Off';
  if (type === 'sick') return 'Sick Time Off';
  return 'Unpaid Leave';
}

// mode: 'employee' -> own history, no actions. 'admin' -> shows employee name + approve/reject
export default function TimeOffTable({ mode, rows, onApprove, onReject }) {
  if (!rows || !rows.length) {
    return <div className="empty-state">No time off requests yet.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {mode === 'admin' && <th>Employee</th>}
          <th>Start Date</th>
          <th>End Date</th>
          <th>Type</th>
          <th>Attachment</th>
          <th>Status</th>
          {mode === 'admin' && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {mode === 'admin' && (
              <td>
                <div className="table-employee-cell">
                  <Avatar firstName={row.first_name} lastName={row.last_name} size="sm" />
                  {row.first_name} {row.last_name}
                </div>
              </td>
            )}
            <td>{new Date(row.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td>{new Date(row.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td>{leaveTypeLabel(row.leave_type)}</td>
            <td>
              {row.attachment_url ? (
                <span
                  className="attachment-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`${API_URL}${row.attachment_url}`, '_blank');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Paperclip size={13} /> Attachment
                </span>
              ) : (
                <span className="field-hint">—</span>
              )}
            </td>
            <td><StatusPill status={row.status} /></td>
            {mode === 'admin' && (
              <td>
                {row.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="approve" size="sm" onClick={() => onApprove(row.id)}>
                      <Check size={14} />
                    </Button>
                    <Button variant="reject" size="sm" onClick={() => onReject(row.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  '-'
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
