import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500/90 text-slate-950 font-semibold px-3 py-2 text-xs shadow-xl backdrop-blur-xs border border-amber-400 animate-pulse"
    >
      <WifiOff className="w-4 h-4" />
      <span>Modo Offline — Dados e leituras salvos em cache local.</span>
    </div>
  );
};
