import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors cursor-pointer"
        title="Instalar Inventa KAF no dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Instalar PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Para usar o <strong>Inventa KAF</strong> com suporte offline e scanner de tela cheia:
              </p>
              <ol className="mt-3 text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                <li>Toque no botão <strong>Partilhar (Share)</strong> na barra inferior do Safari.</li>
                <li>Deslize para baixo e selecione <strong>Adicionar ao Ecrã Principal</strong>.</li>
                <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
