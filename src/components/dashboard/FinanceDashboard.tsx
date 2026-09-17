import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  Receipt,
  FileCheck,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface FinanceDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ onNavigateTab }) => {
  const {
    invoices,
    accountsPayable,
    accountsReceivable,
    financialAccounts,
  } = useApp();

  // Financial Balances
  const cashAccounts = financialAccounts.filter((a) => a.type === 'CAIXA');
  const bankAccounts = financialAccounts.filter((a) => a.type === 'BANCO');
  const totalCash = cashAccounts.reduce((s, a) => s + a.balance, 0);
  const totalBank = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const totalAvailable = totalCash + totalBank;

  // Invoices metrics (Section 28)
  const paidInvoices = invoices.filter((i) => i.status === 'PAID');
  const pendingInvoices = invoices.filter((i) => i.status === 'ISSUED');
  const totalInvoicedRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const averageTicket = paidInvoices.length > 0 ? totalInvoicedRevenue / paidInvoices.length : 0;

  // Accounts Payable & Receivable (Section 27)
  const totalReceivable = accountsReceivable.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
  const totalPayable = accountsPayable.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Módulo Integrado
            </span>
            <span className="text-xs text-slate-400">Contabilidade & Tesouraria</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dashboard Financeiro & Faturação
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Sincronização contínua: Cada fatura emitida gera baixa no estoque e lançamento no Livro Diário
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('invoicing')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Emitir Nova Fatura</span>
        </button>
      </div>

      {/* Primary Financial Overview Grid (Section 27) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Disponível */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Disponibilidade Total</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalAvailable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Soma de Caixas e Bancos</p>
        </div>

        {/* Saldo em Bancos */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-medium">Saldos Bancários (BAI/BFA)</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {formatCurrency(totalBank)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Contas correntes de depósitos</p>
        </div>

        {/* Contas a Receber */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-medium">Contas a Receber</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-indigo-300 font-mono">
            {formatCurrency(totalReceivable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Faturas pendentes a prazo</p>
        </div>

        {/* Contas a Pagar */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium">Contas a Pagar</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatCurrency(totalPayable)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fornecedores e contas de serviços</p>
        </div>
      </div>

      {/* Invoicing Specific KPIs (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Total Faturado (Receita)</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {formatCurrency(totalInvoicedRevenue)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Faturas liquidadas
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Faturas Emitidas</div>
          <div className="text-lg font-bold text-white font-mono mt-1">{invoices.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Série FT 2026 e FS 2026</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Ticket Médio</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {formatCurrency(averageTicket)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Por fatura liquidada</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Faturas Pendentes</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-1">
            {pendingInvoices.length}
          </div>
          <div className="text-[10px] text-amber-400 mt-1">Aguardando pagamento</div>
        </div>
      </div>

      {/* Two Column Layout: Bank Accounts & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caixa e Contas Bancárias */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Contas de Caixa & Bancos</h3>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Gerir Contas
            </button>
          </div>

          <div className="space-y-2.5">
            {financialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      acc.type === 'BANCO'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {acc.type === 'BANCO' ? <Building2 className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{acc.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {acc.accountNumber || 'Dinheiro Físico'} {acc.bankName && `• ${acc.bankName}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">
                    {formatCurrency(acc.balance)}
                  </div>
                  <span className="text-[10px] text-slate-500">{acc.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faturas Recentes */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Últimas Faturas Emitidas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('invoicing')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{inv.number}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : inv.status === 'ISSUED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {inv.status === 'PAID' ? 'PAGO' : inv.status === 'ISSUED' ? 'PENDENTE' : 'ANULADA'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    Cliente: {inv.customerName}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Data: {formatDate(inv.date)} • Via {inv.paymentMethod}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {formatCurrency(inv.total)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {inv.items.length} {inv.items.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
