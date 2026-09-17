import React from 'react';
import {
  Scan,
  Warehouse as WarehouseIcon,
  ShoppingCart,
  UserCheck,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenQuickPOS: () => void;
  onOpenUserPermissions: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickPOS,
  onOpenUserPermissions,
}) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    openScannerModal,
  } = useApp();

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800"
    >
      {/* Brand & Warehouse Selector */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
                KAF
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              INVENTA KAF
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ERP v2.6
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Inventário, Estoque, Faturação & Contabilidade
            </p>
          </div>
        </div>

        {/* Warehouse Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <WarehouseIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 text-[11px]">Armazém:</span>
          <select
            id="warehouse-selector"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs border-none focus:outline-hidden cursor-pointer"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                {w.name} ({w.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Center: Universal Scanner, POS, User Switcher, PWA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Universal Scanner Quick Button */}
        <button
          id="header-scanner-btn"
          onClick={() => openScannerModal('LOOKUP')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer group"
          title="Abrir Scanner USB, Bluetooth ou Câmera"
        >
          <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Escanear</span>
        </button>

        {/* Quick POS / Venda Rápida Button */}
        <button
          id="header-pos-btn"
          onClick={onOpenQuickPOS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          title="Modo Venda Rápida / PDV"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Venda Rápida</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Active User Switcher (For testing roles and permissions in section 31) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="relative group">
            <button
              id="user-profile-menu-btn"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-indigo-400"
              />
              <div className="text-left hidden lg:block">
                <span className="block font-semibold text-white leading-tight text-[11px]">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-slate-400 leading-tight">
                  {currentUser.role === 'ADMIN' && 'Administrador Geral'}
                  {currentUser.role === 'OPERATOR_STOCK' && 'Operador Estoque'}
                  {currentUser.role === 'OPERATOR_INVOICE' && 'Faturação & Caixa'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu for Quick User Switching */}
            <div className="absolute right-0 mt-1 w-60 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 hidden group-hover:block z-50 text-xs">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Alternar Utilizador de Teste:
              </div>
              <div className="py-1 space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {u.role === 'ADMIN' ? 'Acesso Total' : u.role === 'OPERATOR_STOCK' ? 'Estoque e Scanner' : 'Faturação e Vendas'}
                      </div>
                    </div>
                    {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
              <div className="pt-1.5 mt-1 border-t border-slate-800">
                <button
                  onClick={onOpenUserPermissions}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Gerir Permissões Granulares (Seção 31)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
