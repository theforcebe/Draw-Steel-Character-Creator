interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
  compact?: boolean;
}

export function ParchmentCard({
  children,
  className = '',
  selected = false,
  onClick,
  hoverable = false,
  compact = false,
}: ParchmentCardProps) {
  const classes = [
    'card rounded-lg transition-all duration-200',
    compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
    selected ? 'card-selected' : '',
    hoverable ? 'card-hover' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ].filter(Boolean).join(' ');

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={classes}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
