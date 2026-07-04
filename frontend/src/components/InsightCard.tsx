import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function InsightCard({ insight }: { insight: any }) {
  const Icon = insight.type === 'success' ? CheckCircle : insight.type === 'danger' ? ShieldAlert : AlertTriangle;
  const color = insight.type === 'success' ? 'text-emerald-400' : insight.type === 'danger' ? 'text-rose-400' : 'text-amber-400';

  return (
    <div className={`p-4 rounded-xl border ${color} bg-white/2 border-white/5`}> 
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6" />
        <div>
          <div className="font-semibold text-white">{insight.title}</div>
          <div className="text-sm text-gray-300 mt-1">{insight.message}</div>
        </div>
      </div>
    </div>
  );
}
