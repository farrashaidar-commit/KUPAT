import { motion } from 'framer-motion';

type Item = {
  label: string;
  value: number;
  max: number;
  color?: string;
};

export default function BudgetProgress({ items }: { items: Item[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Budget Progress</h4>
      <div className="space-y-3">
        {items.map((it, idx) => {
          const pct = Math.min(100, Math.round((it.value / it.max) * 100));
          return (
            <div key={idx}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">{it.label}</div>
                <div className="text-sm font-semibold text-white">{pct}%</div>
              </div>
              <div className="mt-2 w-full bg-white/3 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9 }}
                  className="h-3 rounded-full"
                  style={{ background: it.color || 'linear-gradient(90deg,#10b981,#34d399)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
