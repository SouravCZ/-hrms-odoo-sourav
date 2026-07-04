export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn-primary' : '',
    variant === 'outline' ? 'btn-outline' : '',
    variant === 'approve' ? 'btn-approve' : '',
    variant === 'reject' ? 'btn-reject' : '',
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
