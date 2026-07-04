function formatRupee(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function SalaryInfoTab({ salary }) {
  if (!salary) {
    return <div className="empty-state">No salary structure has been set up for this employee yet.</div>;
  }

  const { earnings, deductions } = salary;

  return (
    <div>
      <div className="section-title">Earnings</div>
      <div className="card">
        <SalaryRow label="Basic Salary" amount={earnings.basicSalary} wage={salary.monthWage} />
        <SalaryRow label="HRA" amount={earnings.hra} wage={salary.monthWage} />
        <SalaryRow label="Standard Allowance" amount={earnings.standardAllowance} wage={salary.monthWage} />
        <SalaryRow label="Performance Bonus" amount={earnings.performanceBonus} wage={salary.monthWage} />
        <SalaryRow label="Leave Travel Allowance" amount={earnings.leaveTravelAllowance} wage={salary.monthWage} />
        <SalaryRow label="Fixed Allowance" amount={earnings.fixedAllowance} wage={salary.monthWage} />
      </div>

      <div className="section-title">Deductions</div>
      <div className="card">
        <SalaryRow label="Provident Fund" amount={deductions.providentFundEmployee} wage={salary.monthWage} />
        <SalaryRow label="Professional Tax" amount={deductions.professionalTax} wage={salary.monthWage} />
      </div>
    </div>
  );
}

function SalaryRow({ label, amount, wage }) {
  const pct = wage ? ((amount / wage) * 100).toFixed(2) : '0.00';
  return (
    <div className="salary-row">
      <span>{label}</span>
      <span className="amount">{formatRupee(amount)}</span>
      <span className="pct">{pct}%</span>
    </div>
  );
}
