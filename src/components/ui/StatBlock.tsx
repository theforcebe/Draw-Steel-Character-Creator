interface StatBlockProps {
  label: string;
  value: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StatBlock({ label, value, size = 'md' }: StatBlockProps) {
  const sizes = {
    sm: { box: 'w-12 h-14', val: 'text-base', lbl: 'text-[0.55rem]' },
    md: { box: 'w-16 h-20', val: 'text-xl', lbl: 'text-[0.6rem]' },
    lg: { box: 'w-20 h-24', val: 'text-2xl', lbl: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <div className={`${s.box} flex flex-col items-center justify-center rounded-md border border-gold/20 bg-surface-light`}>
      <span className={`font-heading font-bold text-gold-light ${s.val} leading-none`}>
        {value >= 0 ? `+${value}` : value}
      </span>
      <span className={`font-heading uppercase tracking-wider text-gold-muted ${s.lbl} mt-0.5`}>
        {label}
      </span>
    </div>
  );
}
