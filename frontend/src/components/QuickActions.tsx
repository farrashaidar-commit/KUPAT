import { motion } from 'framer-motion';
import { Plus, FileText, Cpu, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinancialStore } from '../store/useFinancialStore';
import { apiFetch } from '../utils/api';

type Action = {
  id: string;
  label: string;
  icon: React.FC<any> | React.ComponentType<any>;
  onClick: () => void;
};

export default function QuickActions() {
  const navigate = useNavigate();
  const { fetchDashboard } = useFinancialStore();

  const actions: Action[] = [
    {
      id: 'add',
      label: 'Add Transaction',
      icon: Plus,
      onClick: () => navigate('/transactions'),
    },
    {
      id: 'budget',
      label: 'Create Budget',
      icon: Archive,
      onClick: () => navigate('/budgets'),
    },
    {
      id: 'export',
      label: 'Export Report',
      icon: FileText,
      onClick: async () => {
        try {
          const data = await apiFetch('/reports/export', { method: 'POST' });
          const blob = new Blob([atob(data.data.csv)], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = data.data.filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error(error);
          alert('Gagal mengekspor laporan.');
        }
      },
    },
    {
      id: 'ai',
      label: 'AI Analysis',
      icon: Cpu,
      onClick: async () => {
        await fetchDashboard();
      },
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Actions</h4>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <motion.button
            key={a.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-b from-white/2 to-white/1 border border-white/5 text-sm text-white shadow-md"
            onClick={a.onClick}
            aria-label={a.label}
          >
            <a.icon className="w-5 h-5 text-white/90" />
            <span className="font-medium">{a.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
