import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateSalary } from '../../services/api';

export default function SalaryFormModal({ userId, salary, onClose, onSaved }) {
  const [form, setForm] = useState({
    monthWage: salary?.monthWage || '',
    basicPct: salary ? '' : 50,
    hraPct: salary ? '' : 50,
    standardAllowance: salary?.earnings?.standardAllowance || 0,
    performanceBonus: salary?.earnings?.performanceBonus || 0,
    leaveTravelAllowance: salary?.earnings?.leaveTravelAllowance || 0,
    fixedAllowance: salary?.earnings?.fixedAllowance || 0,
    pfEmployeePct: salary ? '' : 12,
    pfEmployerPct: salary ? '' : 13.75,
    professionalTax: salary?.deductions?.professionalTax || 200,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => {
    const val = e.target.value;
    setForm({ ...form, [field]: val === '' ? '' : Number(val) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload[k] = v;
      });
      await updateSalary(userId, payload);
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Could not update salary';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title={salary ? 'Edit Salary' : 'Set Salary'} boxClassName="modal-wide">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label>Monthly Wage (INR)</label>
          <input
            type="number"
            value={form.monthWage}
            onChange={update('monthWage')}
            min="0"
            step="0.01"
            placeholder="e.g. 50000"
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Basic %</label>
            <input type="number" value={form.basicPct} onChange={update('basicPct')} min="0" max="100" />
          </div>
          <div className="field">
            <label>HRA % (of Basic)</label>
            <input type="number" value={form.hraPct} onChange={update('hraPct')} min="0" max="100" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Standard Allowance</label>
            <input type="number" value={form.standardAllowance} onChange={update('standardAllowance')} min="0" />
          </div>
          <div className="field">
            <label>Performance Bonus</label>
            <input type="number" value={form.performanceBonus} onChange={update('performanceBonus')} min="0" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Leave Travel Allowance</label>
            <input type="number" value={form.leaveTravelAllowance} onChange={update('leaveTravelAllowance')} min="0" />
          </div>
          <div className="field">
            <label>Fixed Allowance</label>
            <input type="number" value={form.fixedAllowance} onChange={update('fixedAllowance')} min="0" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>PF Employee %</label>
            <input type="number" value={form.pfEmployeePct} onChange={update('pfEmployeePct')} min="0" max="100" />
          </div>
          <div className="field">
            <label>PF Employer %</label>
            <input type="number" value={form.pfEmployerPct} onChange={update('pfEmployerPct')} min="0" max="100" />
          </div>
        </div>

        <div className="field">
          <label>Professional Tax</label>
          <input type="number" value={form.professionalTax} onChange={update('professionalTax')} min="0" />
        </div>

        <div className="modal-footer">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Salary'}</Button>
        </div>
      </form>
    </Modal>
  );
}
