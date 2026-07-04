import { useState } from 'react';
import { X, Plus, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { updateMyResume } from '../../services/api';

export default function ResumeTab({ employee, isSelf, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState(employee.about || '');
  const [skills, setSkills] = useState(employee.skills || []);
  const [certifications, setCertifications] = useState(employee.certifications || []);
  const [newSkill, setNewSkill] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertLink, setNewCertLink] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    const val = newSkill.trim();
    if (!val) return;
    if (skills.includes(val)) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, val]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddCert = () => {
    const name = newCertName.trim();
    if (!name) return;
    setCertifications([...certifications, { name, link: newCertLink.trim() || '' }]);
    setNewCertName('');
    setNewCertLink('');
  };

  const handleRemoveCert = (idx) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyResume(employee.id, { about, skills, certifications });
      toast.success('Resume updated');
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update resume');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAbout(employee.about || '');
    setSkills(employee.skills || []);
    setCertifications(employee.certifications || []);
    setNewSkill('');
    setNewCertName('');
    setNewCertLink('');
    setEditing(false);
  };

  return (
    <div>
      {isSelf && !editing && (
        <div style={{ marginBottom: 16 }}>
          <Button size="sm" onClick={() => setEditing(true)}>Edit Resume</Button>
        </div>
      )}

      {isSelf && editing && (
        <div style={{ marginBottom: 16 }}>
          <div className="field">
            <label>About</label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write a short bio about yourself..."
            />
          </div>
        </div>
      )}

      {!isSelf && (
        <>
          <div className="section-title">About</div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {employee.about ||
              `${employee.first_name} works as a ${employee.job_title || 'team member'} in the ${employee.department || 'company'} team.`}
          </p>
        </>
      )}

      {isSelf && editing && (
        <>
          <div className="section-title">Skills</div>
          <div className="skill-edit-row">
            {skills.map((s) => (
              <span key={s} className="skill-pill">
                {s}
                <button className="skill-remove" onClick={() => handleRemoveSkill(s)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="skill-add-row">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <Button variant="outline" size="sm" onClick={handleAddSkill}>
              <Plus size={14} /> Add
            </Button>
          </div>

          <div className="section-title">Certifications</div>
          <div className="cert-list">
            {certifications.map((c, i) => (
              <div key={i} className="cert-item">
                <span className="cert-name">
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="cert-link">
                      {c.name} <ExternalLink size={12} />
                    </a>
                  ) : (
                    c.name
                  )}
                </span>
                <button className="skill-remove" onClick={() => handleRemoveCert(i)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="cert-add-row">
            <input
              value={newCertName}
              onChange={(e) => setNewCertName(e.target.value)}
              placeholder="Certification name"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
            />
            <input
              value={newCertLink}
              onChange={(e) => setNewCertLink(e.target.value)}
              placeholder="Link (optional)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
            />
            <Button variant="outline" size="sm" onClick={handleAddCert}>
              <Plus size={14} /> Add
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}

      {!editing && (
        <>
          {isSelf && (
            <>
              <div className="section-title">About</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {employee.about ||
                  `${employee.first_name} works as a ${employee.job_title || 'team member'} in the ${employee.department || 'company'} team.`}
              </p>
            </>
          )}

          <div className="section-title">Skills</div>
          <div>
            {(employee.skills || []).length
              ? employee.skills.map((s) => (
                  <span key={s} className="skill-pill">{s}</span>
                ))
              : <span className="field-hint">No skills added yet.</span>}
          </div>

          <div className="section-title">Certifications</div>
          <div>
            {(employee.certifications || []).length
              ? employee.certifications.map((c, i) => (
                  <div key={i} className="cert-item" style={{ marginBottom: 4 }}>
                    {c.link ? (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="cert-link">
                        {c.name} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </div>
                ))
              : <span className="field-hint">No certifications added yet.</span>}
          </div>
        </>
      )}
    </div>
  );
}
