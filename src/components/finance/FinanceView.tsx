import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckCircle2,
  Calendar,
  Building2,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FinanceView: React.FC = () => {
  const {
    accountsPayable,
    accountsReceivable,
    accountingEntries,
    financialAccounts,
    payAccountPayable,
    receiveAccountReceivable,
  } = useApp();

  const [activeFinanceTab, setActiveFinanceTab] = useState<'RECEIVABLE' | 'PAYABLE' | 'LEDGER'>(
    'RECEIVABLE'
  );
  const [selectedFinancialAccountId, setSelectedFinancialAccountId] = useState(
    financialAccounts[0]?.id || 'acc-1'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Finanças & Contabilidade Integrada
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Contas a Pagar, Contas a Receber e Livro Diário (Partidas Dobradas automáticas)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFinanceTab('RECEIVABLE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeFinanceTab === 'RECEIVABLE'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Receber
          </button>
          <button
            onClick={() => setActiveFinanceTab('PAYABLE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeFinanceTab === 'PAYABLE'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Pagar
          </button>
          <button
            onClick={() => setActiveFinanceTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeFinanceTab === 'LEDGER'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Livro Diário Contábil
          </button>
        </div>
      </div>

      {/* Account Balances Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {financialAccounts.map((acc) => (
          <div
            key={acc.id}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  acc.type === 'BANCO'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {acc.type === 'BANCO' ? <Building2 className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{acc.name}</div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {acc.bankName || 'Caixa Físico'}
                </span>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-white">
              {formatCurrency(acc.balance)}
            </div>
          </div>
        ))}
      </div>

      {/* TAB 1: Contas a Receber */}
      {activeFinanceTab === 'RECEIVABLE' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fatura / Descrição</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Data Vencimento</th>
                    <th className="py-3 px-4 text-right">Valor a Receber</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {accountsReceivable.map((ar) => (
                    <tr key={ar.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold font-mono text-white text-xs block">
                          {ar.invoiceNumber || 'Documento a Prazo'}
                        </span>
                        <span className="text-[11px] text-slate-400">{ar.description}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white">{ar.customerName}</td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">{formatDate(ar.dueDate)}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(ar.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ar.status === 'RECEIVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ar.status === 'RECEIVED' ? 'RECEBIDO' : 'PENDENTE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {ar.status === 'PENDING' ? (
                          <button
                            onClick={() => receiveAccountReceivable(ar.id, selectedFinancialAccountId)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Dar Quitação
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Liquidado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Contas a Pagar */}
      {activeFinanceTab === 'PAYABLE' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Descrição / Fornecedor</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4 text-right">Valor a Pagar</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {accountsPayable.map((ap) => (
                    <tr key={ap.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white text-xs block">{ap.description}</span>
                        <span className="text-[11px] text-slate-400">
                          {ap.supplierName || 'Fornecedor de Serviços'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">{ap.category}</td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">{formatDate(ap.dueDate)}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                        {formatCurrency(ap.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            ap.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {ap.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {ap.status === 'PENDING' ? (
                          <button
                            onClick={() => payAccountPayable(ap.id, selectedFinancialAccountId)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Pago
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Livro Diário de Contabilidade */}
      {activeFinanceTab === 'LEDGER' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Lançamentos Contábeis de Partidas Dobradas gerados automaticamente pela Faturação e Estoque.
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              PGC Angolano (Plano Geral de Contabilidade)
            </span>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Data & Horário</th>
                    <th className="py-3 px-4">Descrição do Lançamento</th>
                    <th className="py-3 px-4">Conta Débito (Origem)</th>
                    <th className="py-3 px-4">Conta Crédito (Destino)</th>
                    <th className="py-3 px-4 text-right">Valor (Kz)</th>
                    <th className="py-3 px-4 text-center">Ref. Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {accountingEntries.map((ent) => (
                    <tr key={ent.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatDate(ent.date)} {ent.time}
                      </td>

                      <td className="py-3 px-4 font-medium text-white">{ent.description}</td>

                      <td className="py-3 px-4 font-mono text-sky-400 text-[11px]">
                        {ent.debitAccount}
                      </td>

                      <td className="py-3 px-4 font-mono text-indigo-400 text-[11px]">
                        {ent.creditAccount}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(ent.amount)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        {ent.documentRef || 'AUTO'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
