interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
}

export function GoldButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'primary',
}: GoldButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
    >
      {children}
    </button>
  );
}
