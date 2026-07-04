import { motion } from 'framer-motion';
import CountUp from './CountUp';

type Props = {
  title: string;
  value: number;
  prefix?: string;
  icon: React.FC<any> | React.ComponentType<any>;
  color?: string;
};

export default function StatCard({ title, value, prefix = 'Rp', icon: Icon, color = 'emerald' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl bg-[#0d1322] border border-[#1e293b] flex items-center justify-between shadow-sm`}
    >
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold mt-2 text-white">
          {prefix} <span className="text-xl font-bold"><CountUp to={value} formatter={(n)=>n.toLocaleString('id-ID')} /></span>
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-${color}-400`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
