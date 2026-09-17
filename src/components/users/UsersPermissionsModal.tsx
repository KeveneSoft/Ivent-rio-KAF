import React, { useState } from 'react';
import {
  ShieldAlert,
  User,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  X,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserPermissions } from '../../types';

interface UsersPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersPermissionsModal: React.FC<UsersPermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, currentUser, setCurrentUser, updateUserPermissions, resetToDemoData } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'usr-1');

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleTogglePermission = (key: keyof UserPermissions) => {
    const currentVal = !!selectedUser.permissions[key];
    updateUserPermissions(selectedUser.id, {
      [key]: !currentVal,
    });
  };

  const permissionLabels: { key: keyof UserPermissions; label: string; group: string }[] = [
    { key: 'createProduct', label: 'Cadastrar novos produtos no catálogo', group: 'Estoque' },
    { key: 'editPrices', label: 'Alterar preços de venda', group: 'Estoque' },
    { key: 'viewCostPrice', label: 'Visualizar preços de custo e margens', group: 'Estoque' },
    { key: 'stockIn', label: 'Registrar entradas de mercadorias no estoque', group: 'Estoque' },
    { key: 'stockOut', label: 'Registrar saídas manuais e requisições', group: 'Estoque' },
    { key: 'stockTransfer', label: 'Realizar transferências entre armazéns', group: 'Estoque' },
    { key: 'performInventoryCount', label: 'Participar de contagens de inventário físico', group: 'Inventário' },
    { key: 'approveInventoryAdjustment', label: 'Aprovar desvios e ajustes de inventário (Crítico)', group: 'Inventário' },
    { key: 'issueInvoice', label: 'Emitir faturas, recibos e orçamentos', group: 'Faturação' },
    { key: 'cancelInvoice', label: 'Anular faturas emitidas e estornar estoque', group: 'Faturação' },
    { key: 'applyDiscounts', label: 'Aplicar descontos comerciais nas faturas', group: 'Faturação' },
    { key: 'viewFinancialReports', label: 'Visualizar relatórios financeiros (Receitas/Despesas)', group: 'Finanças' },
    { key: 'viewAccountingLedger', label: 'Acessar o Livro Diário de contabilidade', group: 'Finanças' },
    { key: 'manageUsers', label: 'Gerenciar outros utilizadores e permissões', group: 'Administração' },
  ];

  return (
    <div
      id="users-permissions-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Gestão de Utilizadores & Permissões Granulares (Seção 31)
              </h3>
              <p className="text-xs text-slate-400">
                Configure permissões detalhadas por função e alterne o usuário ativo em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* User selector list */}
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Selecione o Utilizador para Configurar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = u.id === selectedUser.id;
                const isCurrent = u.id === currentUser.id;

                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate">{u.name}</div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {u.role === 'ADMIN'
                            ? 'Administrador'
                            : u.role === 'OPERATOR_STOCK'
                            ? 'Operador Estoque'
                            : 'Operador Faturação'}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Sessão Atual
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Log In As This User */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 text-xs">
              Testar interface com o perfil de <strong>{selectedUser.name}</strong>:
            </span>
            <button
              onClick={() => setCurrentUser(selectedUser)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
            >
              Assumir Sessão Deste Utilizador
            </button>
          </div>

          {/* Granular Checkboxes Grid */}
          <div className="space-y-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Permissões Granulares Ativas para {selectedUser.name}:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {permissionLabels.map((item) => {
                const isChecked = !!selectedUser.permissions[item.key];

                return (
                  <label
                    key={item.key}
                    onClick={() => handleTogglePermission(item.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-slate-950 border-emerald-500/30 text-white'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] font-medium block leading-tight">
                        {item.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 block">
                        {item.group}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Deseja restaurar todos os dados e contagens para o estado inicial de demonstração?')) {
                  resetToDemoData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados Iniciais de Demonstração
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
