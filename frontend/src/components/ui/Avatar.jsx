import StatusDot from './StatusDot';

function getInitials(firstName = '', lastName = '') {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export default function Avatar({ firstName, lastName, status, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';
  return (
    <div className={`avatar ${sizeClass}`}>
      {getInitials(firstName, lastName)}
      {status && <StatusDot status={status} />}
    </div>
  );
}
