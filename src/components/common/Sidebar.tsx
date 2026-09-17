import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Layers,
  FileText,
  ShoppingCart,
  ClipboardCheck,
  ShieldCheck,
  DollarSign,
  Activity,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavTab =
  | 'dashboard-stock'
  | 'dashboard-finance'
  | 'products'
  | 'warehouses'
  | 'invoicing'
  | 'pos'
  | 'inventory'
  | 'assets'
  | 'finance'
  | 'audit'
  | 'labels';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenUserPermissions: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUserPermissions,
}) => {
  const { products, getProductStock, inventorySessions, invoices, accountsReceivable } = useApp();

  // Badges calculations
  const lowStockCount = products.filter((p) => getProductStock(p.id) <= p.minStock).length;
  const pendingInventoryCount = inventorySessions.filter((s) => s.status === 'PENDING_APPROVAL').length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'ISSUED').length;

  const navGroups = [
    {
      label: 'Visão & Indicadores',
      items: [
        {
          id: 'dashboard-stock' as NavTab,
          label: 'Dashboard Estoque',
          icon: LayoutDashboard,
          badge: lowStockCount > 0 ? `${lowStockCount} alertas` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
        {
          id: 'dashboard-finance' as NavTab,
          label: 'Dashboard Financeiro',
          icon: TrendingUp,
        },
      ],
    },
    {
      label: 'Operações & Estoque',
      items: [
        {
          id: 'products' as NavTab,
          label: 'Produtos & Catálogo',
          icon: Package,
        },
        {
          id: 'warehouses' as NavTab,
          label: 'Armazéns & Estantes',
          icon: Layers,
        },
        {
          id: 'inventory' as NavTab,
          label: 'Inventário Físico',
          icon: ClipboardCheck,
          badge: pendingInventoryCount > 0 ? `${pendingInventoryCount} aprovar` : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        },
        {
          id: 'assets' as NavTab,
          label: 'Ativos / Patrimônio',
          icon: ShieldCheck,
        },
      ],
    },
    {
      label: 'Comercial & Vendas',
      items: [
        {
          id: 'invoicing' as NavTab,
          label: 'Faturação',
          icon: FileText,
          badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} pend.` : undefined,
          badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
        },
        {
          id: 'pos' as NavTab,
          label: 'Venda Rápida / PDV',
          icon: ShoppingCart,
        },
      ],
    },
    {
      label: 'Gestão & Contabilidade',
      items: [
        {
          id: 'finance' as NavTab,
          label: 'Finanças & Diário',
          icon: DollarSign,
        },
        {
          id: 'audit' as NavTab,
          label: 'Auditoria Central',
          icon: Activity,
        },
        {
          id: 'labels' as NavTab,
          label: 'Gerador de Etiquetas',
          icon: Printer,
        },
      ],
    },
  ];

  return (
    <aside
      id="main-app-sidebar"
      className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-61px)] shrink-0 overflow-y-auto"
    >
      <div className="p-3 space-y-6 flex-1">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Permissions button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onOpenUserPermissions}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Permissões de Utilizadores</span>
        </button>
      </div>
    </aside>
  );
};
