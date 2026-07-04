import { useEffect, useRef, useState } from 'react';

type Props = {
  from?: number;
  to: number;
  duration?: number; // seconds
  formatter?: (n: number) => string;
};

export default function CountUp({ from = 0, to, duration = 1.2, formatter }: Props) {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const diff = to - from;

    function tick(now: number) {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + diff * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [from, to, duration]);

  return <>{formatter ? formatter(value) : value.toLocaleString('id-ID')}</>;
}
