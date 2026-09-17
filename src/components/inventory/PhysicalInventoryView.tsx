import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  XCircle,
  TrendingDown,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const PhysicalInventoryView: React.FC = () => {
  const {
    inventorySessions,
    createInventorySession,
    submitInventoryForApproval,
    approveInventoryAdjustment,
    rejectInventorySession,
    warehouses,
    openScannerModal,
    currentUser,
  } = useApp();

  const [activeSessionId, setActiveSessionId] = useState<string>(
    inventorySessions[0]?.id || ''
  );

  // New session modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWarehouseId, setNewWarehouseId] = useState('wh-1');
  const [newNotes, setNewNotes] = useState('');

  const currentSession =
    inventorySessions.find((s) => s.id === activeSessionId) || inventorySessions[0];

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createInventorySession(newTitle, newWarehouseId, newNotes);
    setActiveSessionId(created.id);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const hasApprovalPermission = currentUser.permissions.approveInventoryAdjustment;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            Inventário Físico & Auditoria de Contagem
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Leitura sistemática de produtos e estantes, cálculo de divergências e aprovação de ajustes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentSession && currentSession.status === 'COUNTING' && (
            <button
              onClick={() => openScannerModal('INVENTORY_COUNT', currentSession.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Contar com Scanner</span>
            </button>
          )}

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Sessão</span>
          </button>
        </div>
      </div>

      {/* Session Selector Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {inventorySessions.map((sess) => {
          const isSelected = sess.id === currentSession?.id;
          const totalItems = sess.items.length;
          const itemsWithDiff = sess.items.filter((i) => i.difference !== 0).length;

          return (
            <button
              key={sess.id}
              onClick={() => setActiveSessionId(sess.id)}
              className={`p-3.5 rounded-xl text-left border min-w-64 shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-indigo-300">{sess.code}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sess.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : sess.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300'
                      : sess.status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-sky-500/20 text-sky-300'
                  }`}
                >
                  {sess.status === 'APPROVED' && 'APROVADO'}
                  {sess.status === 'PENDING_APPROVAL' && 'AGUARDA APROVAÇÃO'}
                  {sess.status === 'REJECTED' && 'REJEITADO'}
                  {sess.status === 'COUNTING' && 'EM CONTAGEM'}
                </span>
              </div>
              <div className="font-semibold text-white text-xs truncate">{sess.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{sess.warehouseName}</span>
                <span className="text-[10px] text-slate-500">
                  {itemsWithDiff > 0 ? `${itemsWithDiff} divergências` : '100% conciliado'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Session Content */}
      {currentSession && (
        <div className="space-y-4">
          {/* Status & Approval Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {currentSession.title} ({currentSession.code})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  • Início: {formatDate(currentSession.startedAt)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Armazém: <span className="font-semibold text-slate-200">{currentSession.warehouseName}</span> | Supervisor:{' '}
                <span className="font-semibold text-slate-200">{currentSession.supervisorName}</span>
                {currentSession.approvedBy && (
                  <> | Aprovado por: <span className="text-emerald-400 font-semibold">{currentSession.approvedBy}</span></>
                )}
              </p>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-2">
              {currentSession.status === 'COUNTING' && (
                <button
                  onClick={() => submitInventoryForApproval(currentSession.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Enviar para Aprovação do Administrador</span>
                </button>
              )}

              {currentSession.status === 'PENDING_APPROVAL' && (
                <>
                  {hasApprovalPermission ? (
                    <button
                      onClick={() => approveInventoryAdjustment(currentSession.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprovar Ajuste de Estoque Automático</span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Requer aprovação de um Administrador (ex: Carlos Mendonça)</span>
                    </div>
                  )}

                  {hasApprovalPermission && (
                    <button
                      onClick={() => rejectInventorySession(currentSession.id, 'Divergência requer reconferência física')}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Rejeitar
                    </button>
                  )}
                </>
              )}

              {currentSession.status === 'APPROVED' && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Estoque atualizado com sucesso no sistema</span>
                </div>
              )}
            </div>
          </div>

          {/* Divergence Summary Box */}
          {(() => {
            const matches = currentSession.items.filter((i) => i.difference === 0).length;
            const deficits = currentSession.items.filter((i) => i.difference < 0).length;
            const surpluses = currentSession.items.filter((i) => i.difference > 0).length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Itens Sem Divergência</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{matches}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Déficit (Falta no Estoque)</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">{deficits}</span>
                  </div>
                  <TrendingDown className="w-5 h-5 text-rose-500/60" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Sobra (Excedente)</span>
                    <span className="text-lg font-bold text-sky-400 font-mono">{surpluses}</span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-sky-500/60" />
                </div>
              </div>
            );
          })()}

          {/* Items Comparison Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Produto & Código</th>
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4 text-center">Qtd no Sistema</th>
                    <th className="py-3 px-4 text-center">Qtd Contada</th>
                    <th className="py-3 px-4 text-center">Diferença (Desvio)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentSession.items.map((item) => {
                    const isMatch = item.difference === 0;
                    const isDeficit = item.difference < 0;
                    const isSurplus = item.difference > 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            SKU: {item.sku} • Cód: {item.barcode}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-emerald-400 text-[11px]">
                          {item.locationCode || 'GERAL'}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-300">
                          {item.systemQty}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {item.countedQty}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={
                              isMatch
                                ? 'text-emerald-400'
                                : isDeficit
                                ? 'text-rose-400'
                                : 'text-sky-400'
                            }
                          >
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isMatch
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isDeficit
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {isMatch && 'CORRETO'}
                            {isDeficit && 'FALTA (-)'}
                            {isSurplus && 'SOBRA (+)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-400" />
              Iniciar Nova Sessão de Inventário Físico
            </h3>

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Título do Inventário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inventário de Fechamento Trimestral"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Armazém Alvo *</label>
                <select
                  value={newWarehouseId}
                  onChange={(e) => setNewWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white cursor-pointer"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Observações / Instruções</label>
                <textarea
                  rows={2}
                  placeholder="Instruções para a equipe de contagem física..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Iniciar Contagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
