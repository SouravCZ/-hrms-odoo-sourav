import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { getAttendanceDay } from '../../services/api';

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function formatDisplay(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdminView() {
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAttendanceDay(formatDate(date))
      .then(({ data }) => setRecords(data.records))
      .finally(() => setLoading(false));
  }, [date]);

  const shiftDay = (delta) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    setDate(next);
  };

  return (
    <div>
      <div className="date-nav">
        <div className="date-nav-controls">
          <button onClick={() => shiftDay(-1)}><ChevronLeft size={16} /></button>
          <span>{formatDisplay(date)}</span>
          <button onClick={() => shiftDay(1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading attendance...</div>
      ) : (
        <AttendanceTable mode="admin" rows={records} />
      )}
    </div>
  );
}
