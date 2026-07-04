import { Inbox } from 'lucide-react';

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
};

export default function EmptyState({ title = 'Nothing here', description = '', actionLabel = 'Take Action', onAction, icon: Icon }: Props) {
  const IconComp = Icon || Inbox;
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
      <div className="p-4 rounded-full bg-white/3 inline-flex">
        <IconComp className="w-10 h-10 text-white/90" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-300 max-w-xs">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
