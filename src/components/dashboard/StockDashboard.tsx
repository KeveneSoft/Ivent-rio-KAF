import React from 'react';
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  ClipboardList,
  MapPinOff,
  CheckCircle2,
  Scan,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

interface StockDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const StockDashboard: React.FC<StockDashboardProps> = ({ onNavigateTab }) => {
  const {
    products,
    stockLocations,
    stockMovements,
    inventorySessions,
    warehouses,
    selectedWarehouseId,
    openScannerModal,
    getProductStock,
  } = useApp();

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  // Metrics (Section 26 specification)
  const totalProductsInStock = products.filter((p) => getProductStock(p.id, selectedWarehouseId) > 0).length;
  const lowStockProducts = products.filter((p) => {
    const stock = getProductStock(p.id, selectedWarehouseId);
    return stock > 0 && stock <= p.minStock;
  });
  const outOfStockProducts = products.filter((p) => getProductStock(p.id, selectedWarehouseId) === 0);

  // Today's movements
  const todayDateStr = new Date().toISOString().split('T')[0];
  const movementsToday = stockMovements.filter((m) => m.timestamp.startsWith(todayDateStr));
  const entriesToday = movementsToday.filter((m) => m.type === 'IN').reduce((acc, m) => acc + m.quantity, 0);
  const exitsToday = movementsToday.filter((m) => m.type === 'OUT' || m.type === 'SALE_DEDUCTION').reduce((acc, m) => acc + Math.abs(m.quantity), 0);

  // Pending items
  const pendingInventories = inventorySessions.filter((s) => s.status === 'PENDING_APPROVAL');
  
  // Products without allocated specific rack/shelf location
  const productsWithoutLocation = products.filter((p) => {
    const hasLoc = stockLocations.some((sl) => sl.productId === p.id && sl.locationId && sl.quantity > 0);
    return !hasLoc;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Scanner Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Painel Operacional
            </span>
            <span className="text-xs text-slate-400">
              {currentWarehouse ? `${currentWarehouse.name} (${currentWarehouse.city})` : 'Consolidado'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Gestão de Estoque & Armazéns
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Controle integrado em tempo real com leitor USB, Bluetooth e Câmera de smartphone
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => openScannerModal('INBOUND')}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Entrada Scanner</span>
          </button>
          <button
            onClick={() => openScannerModal('OUTBOUND')}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Saída Scanner</span>
          </button>
          <button
            onClick={() => openScannerModal('LOCATION_ASSIGN')}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Alocar Posição</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Section 26 Requirements) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Produtos em Estoque */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Produtos em Estoque</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalProductsInStock}</div>
          <p className="text-[11px] text-slate-400 mt-1">Itens disponíveis com saldo positivo</p>
        </div>

        {/* Estoque Baixo */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Estoque Baixo (Alerta)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{lowStockProducts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Abaixo do estoque de segurança</p>
        </div>

        {/* Sem Estoque */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/60 transition-colors">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold">Sem Estoque (Ruptura)</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{outOfStockProducts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Saldo zerado no armazém</p>
        </div>

        {/* Entradas Hoje */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">Entradas Hoje</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">+{entriesToday}</div>
          <p className="text-[11px] text-slate-400 mt-1">Unidades recebidas por compras/transferência</p>
        </div>

        {/* Saídas Hoje */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-medium">Saídas Hoje</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">-{exitsToday}</div>
          <p className="text-[11px] text-slate-400 mt-1">Vendas faturadas e requisições internas</p>
        </div>

        {/* Produtos Movimentados Hoje */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Movimentações Hoje</span>
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{movementsToday.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Eventos registrados no diário</p>
        </div>

        {/* Inventários Pendentes */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold">Inventários Pendentes</span>
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">{pendingInventories.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Aguardando aprovação de desvio</p>
        </div>

        {/* Sem Localização */}
        <div
          onClick={() => onNavigateTab('warehouses')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Sem Localização</span>
            <MapPinOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{productsWithoutLocation.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Sem estante/prateleira definida</p>
        </div>
      </div>

      {/* Two Column Section: Low Stock Warnings & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Produtos em Alerta de Estoque</h3>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Ver Catálogo
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-1.5" />
                Nenhum produto em nível crítico de estoque no momento.
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const currentStock = getProductStock(p.id, selectedWarehouseId);
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{p.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>SKU: {p.sku}</span>
                        <span>•</span>
                        <span>Mínimo: {p.minStock} {p.unit}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-400 font-mono text-sm">
                        {currentStock} {p.unit}
                      </div>
                      <button
                        onClick={() => openScannerModal('INBOUND')}
                        className="mt-1 px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 text-[10px] rounded font-medium transition-colors"
                      >
                        Repor Estoque
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Movements Timeline */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Linha de Vida & Movimentações Recentes</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Ver Auditoria
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {stockMovements.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        m.type === 'IN'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.type === 'SALE_DEDUCTION'
                          ? 'bg-sky-500/20 text-sky-300'
                          : m.type === 'OUT'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {m.type === 'IN' && 'ENTRADA'}
                      {m.type === 'SALE_DEDUCTION' && 'VENDA FATURADA'}
                      {m.type === 'OUT' && 'SAÍDA'}
                      {m.type === 'TRANSFER' && 'TRANSFERÊNCIA'}
                      {m.type === 'ADJUSTMENT' && 'AJUSTE'}
                    </span>
                    <span className="font-semibold text-slate-200">{m.productName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{m.notes}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Op: {m.userName}</span>
                    <span>•</span>
                    <span>Dispositivo: {m.deviceUsed}</span>
                    <span>•</span>
                    <span>{formatDate(m.timestamp)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-mono ${
                      m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </span>
                  {m.documentRef && (
                    <span className="block text-[10px] text-slate-500 font-mono">{m.documentRef}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
