export default function Input({ label, hint, ...rest }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <input {...rest} />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}
