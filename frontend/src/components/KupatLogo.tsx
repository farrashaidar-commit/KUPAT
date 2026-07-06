import markUrl from '../assets/kupat-mark.svg';

interface KupatLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export default function KupatLogo({
  className = '',
  iconClassName = 'w-12 h-12',
  textClassName = '',
  showText = false,
}: KupatLogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`.trim()}>
      <div className={`relative shrink-0 ${iconClassName}`.trim()}>
        <img
          src={markUrl}
          alt="KUPAT"
          className="h-full w-full object-contain select-none"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.35))',
          }}
          loading="eager"
          decoding="async"
        />
      </div>
      {showText ? (
        <span className={`ml-3 text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent ${textClassName}`.trim()}>
          KUPAT
        </span>
      ) : null}
    </div>
  );
}
