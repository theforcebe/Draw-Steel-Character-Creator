interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
  compact?: boolean;
  /** Set to true to suppress the built-in selected checkmark (e.g. if the card renders its own) */
  hideCheckmark?: boolean;
}

function SelectedCheckmark() {
  return (
    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/40 ring-2 ring-gold/30 z-10">
      <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export function ParchmentCard({
  children,
  className = '',
  selected = false,
  onClick,
  hoverable = false,
  compact = false,
  hideCheckmark = false,
}: ParchmentCardProps) {
  const classes = [
    'card relative',
    compact ? 'px-4 py-3' : 'px-5 py-4',
    selected ? 'card-selected' : '',
    hoverable ? 'card-hover' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ].filter(Boolean).join(' ');

  const showCheck = selected && onClick && !hideCheckmark;

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
        {showCheck && <SelectedCheckmark />}
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
