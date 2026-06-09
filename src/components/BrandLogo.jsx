const CLINIC_NAME = 'V3 Dental Clinic';

export function BrandLogo({ size = 'md', showTagline = true, className = '' }) {
  const sizes = {
    sm: { img: 'h-8 w-8', title: 'text-sm', tag: 'text-[10px]' },
    md: { img: 'h-11 w-11', title: 'text-lg', tag: 'text-xs' },
    lg: { img: 'h-16 w-16', title: 'text-2xl', tag: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt={`${CLINIC_NAME} logo`}
        className={`${s.img} shrink-0 rounded-lg object-contain`}
      />
      <div className="min-w-0 text-left">
        <p className={`font-bold leading-tight text-brand-800 dark:text-brand-400 ${s.title}`}>
          {CLINIC_NAME}
        </p>
        {showTagline && (
          <p className={`text-slate-500 ${s.tag}`}>Lead follow-up CRM</p>
        )}
      </div>
    </div>
  );
}

export { CLINIC_NAME };
