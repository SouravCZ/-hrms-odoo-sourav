export default function PrivateInfoTab({ employee }) {
  return (
    <div className="field-row">
      <div>
        <div className="field">
          <label>Employee ID</label>
          <input value={employee.employee_code || ''} readOnly />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={employee.email || ''} readOnly />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={employee.phone || ''} readOnly />
        </div>
      </div>
      <div>
        <div className="field">
          <label>Department</label>
          <input value={employee.department || ''} readOnly />
        </div>
        <div className="field">
          <label>Job Title</label>
          <input value={employee.job_title || ''} readOnly />
        </div>
        <div className="field">
          <label>Date of Joining</label>
          <input value={employee.joining_date ? employee.joining_date.slice(0, 10) : ''} readOnly />
        </div>
      </div>
    </div>
  );
}
