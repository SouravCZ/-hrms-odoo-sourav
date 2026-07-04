import Avatar from '../ui/Avatar';

// mode: 'admin' -> rows have employee name, 'employee' -> rows have date
export default function AttendanceTable({ mode, rows }) {
  if (!rows || !rows.length) {
    return <div className="empty-state">No attendance records for this period.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>{mode === 'admin' ? 'Employee' : 'Date'}</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Work Hours</th>
          <th>Extra Hours</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td>
              {mode === 'admin' ? (
                <div className="table-employee-cell">
                  <Avatar firstName={row.first_name} lastName={row.last_name} size="sm" />
                  {row.first_name} {row.last_name}
                </div>
              ) : (
                new Date(row.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              )}
            </td>
            <td>{row.check_in || '-'}</td>
            <td>{row.check_out || '-'}</td>
            <td>{row.work_hours ?? '-'}</td>
            <td>{row.extra_hours ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
