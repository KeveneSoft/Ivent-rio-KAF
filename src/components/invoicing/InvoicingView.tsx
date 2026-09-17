import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Ban,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Barcode,
  Search,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceType, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvoicingView: React.FC = () => {
  const {
    invoices,
    customers,
    products,
    warehouses,
    selectedWarehouseId,
    issueInvoice,
    cancelInvoice,
    currentUser,
    getProductStock,
  } = useApp();

  // Active filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'ISSUED' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Invoice creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('FATURA');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TPA_MULTICAIXA');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [dueDateInput, setDueDateInput] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // Line items for new invoice
  const [draftItems, setDraftItems] = useState<
    { productId: string; quantity: number; unitPrice: number; discountRate: number; taxRate: number }[]
  >([
    {
      productId: products[0]?.id || 'prod-1',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 485000,
      discountRate: 0,
      taxRate: 14,
    },
  ]);

  // Invoice details / Print preview modal
  const [selectedInvoiceToView, setSelectedInvoiceToView] = useState<Invoice | null>(null);

  // Cancel invoice reason dialog
  const [cancelModalInvoiceId, setCancelModalInvoiceId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Erro na seleção de produtos pelo operador');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerNif && inv.customerNif.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const handleAddItemRow = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setDraftItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        quantity: 1,
        unitPrice: defaultProd.sellingPrice,
        discountRate: 0,
        taxRate: 14,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setDraftItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemRow = (
    index: number,
    field: 'productId' | 'quantity' | 'unitPrice' | 'discountRate',
    value: any
  ) => {
    setDraftItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          item.productId = prod.id;
          item.unitPrice = prod.sellingPrice;
          item.taxRate = prod.taxRate || 14;
        }
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Calculations for Draft Invoice
  const draftSubtotal = draftItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const draftDiscount = draftItems.reduce(
    (acc, i) => acc + (i.quantity * i.unitPrice * (i.discountRate || 0)) / 100,
    0
  );
  const draftTax = draftItems.reduce((acc, i) => {
    const base = i.quantity * i.unitPrice * (1 - (i.discountRate || 0) / 100);
    return acc + (base * (i.taxRate || 14)) / 100;
  }, 0);
  const draftTotal = draftSubtotal - draftDiscount + draftTax;

  const handleEmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftItems.length === 0) return;

    const newInv = issueInvoice({
      type: invoiceType,
      customerId: selectedCustomerId,
      warehouseId: selectedWarehouseId,
      paymentMethod,
      items: draftItems,
      notes: invoiceNotes,
      dueDate: dueDateInput,
    });

    setIsCreateModalOpen(false);
    setSelectedInvoiceToView(newInv);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalInvoiceId) return;
    cancelInvoice(cancelModalInvoiceId, cancelReason);
    setCancelModalInvoiceId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Módulo Próprio de Faturação (Seção 2, 3 e 4)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissão integrada: Atualiza estoque, gera contas financeiras e lançamento no Livro Diário
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Documento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número (ex: FT 2026/0095), cliente ou NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'PAID', 'ISSUED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' && 'Todos'}
              {st === 'PAID' && 'Pagas'}
              {st === 'ISSUED' && 'Pendentes'}
              {st === 'CANCELLED' && 'Anuladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Documento / Série</th>
                <th className="py-3 px-4">Data & Vencimento</th>
                <th className="py-3 px-4">Cliente / NIF</th>
                <th className="py-3 px-4">Pagamento & Armazém</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Document Number */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono text-sm">{inv.number}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {inv.type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{formatDate(inv.date)}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Venc: {formatDate(inv.dueDate)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIF: {inv.customerNif}</div>
                    </td>

                    {/* Payment Method & Warehouse */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium">{inv.paymentMethod}</div>
                      <div className="text-[10px] text-slate-500">{inv.warehouseName}</div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(inv.total)}
                      <div className="text-[10px] text-slate-500 font-normal">
                        IVA: {formatCurrency(inv.taxTotal)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : inv.status === 'ISSUED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {inv.status === 'PAID' && 'PAGO'}
                        {inv.status === 'ISSUED' && 'PENDENTE'}
                        {inv.status === 'CANCELLED' && 'ANULADA'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInvoiceToView(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Visualizar / Imprimir Documento"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setCancelModalInvoiceId(inv.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Anular Fatura e Estornar Estoque"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Emitir Documento Comercial (Faturação KAF)
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmitInvoice} className="p-5 space-y-4 text-xs">
              {/* Type, Customer, Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tipo de Documento</label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold cursor-pointer"
                  >
                    <option value="FATURA">Fatura (FT)</option>
                    <option value="FATURA_SIMPLIFICADA">Fatura Simplificada (FS)</option>
                    <option value="ORCAMENTO">Orçamento / Pró-forma</option>
                    <option value="VENDA_DINHEIRO">Venda a Dinheiro (VD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Cliente *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white cursor-pointer"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (NIF: {c.nif})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white cursor-pointer"
                  >
                    <option value="DINHEIRO">Dinheiro (Caixa Geral)</option>
                    <option value="TPA_MULTICAIXA">TPA Multicaixa (Banco)</option>
                    <option value="TRANSFERENCIA">Transferência Bancária</option>
                    <option value="A_PRAZO">A Prazo (Conta a Receber)</option>
                  </select>
                </div>
              </div>

              {/* Line items header */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Itens da Fatura (Baixa de Estoque Automática)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Linha
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {draftItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 items-center"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItemRow(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                        >
                          {products.map((p) => {
                            const currentStock = getProductStock(p.id, selectedWarehouseId);
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} (Saldo: {currentStock} {p.unit})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItemRow(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Preço Unit."
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItemRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-right text-white text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <span className="font-bold text-white text-xs font-mono">
                          {formatCurrency(item.quantity * item.unitPrice * (1 + (item.taxRate || 14) / 100))}
                        </span>
                        {draftItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Panel */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-slate-400 space-y-0.5 text-[11px]">
                  <div>Operador: <span className="text-white font-semibold">{currentUser.name}</span></div>
                  <div>Armazém de Saída: <span className="text-white font-semibold">Armazém Central</span></div>
                </div>

                <div className="w-full sm:w-60 space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Incidência:</span>
                    <span className="font-mono">{formatCurrency(draftSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (14%):</span>
                    <span className="font-mono">{formatCurrency(draftTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-slate-800">
                    <span>Total a Pagar:</span>
                    <span className="text-emerald-400 font-mono">{formatCurrency(draftTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Emitir e Atualizar Estoque / Finanças
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Document Preview Modal */}
      {selectedInvoiceToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden my-4">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Visualização de Fatura Fiscal
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setSelectedInvoiceToView(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content (Paper-like aesthetic) */}
            <div className="p-8 space-y-6 text-xs font-sans print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-indigo-900 tracking-tight">
                    INVENTA KAF, LDA.
                  </h1>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Soluções Empresariais, Logística & Tecnologia
                  </p>
                  <p className="text-slate-600 text-[11px]">NIF: 5418002930</p>
                  <p className="text-slate-600 text-[11px]">Luanda, Angola</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 block font-mono">
                    {selectedInvoiceToView.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-indigo-700 font-mono block">
                    {selectedInvoiceToView.number}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Data: {formatDate(selectedInvoiceToView.date)}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Vencimento: {formatDate(selectedInvoiceToView.dueDate)}
                  </p>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Exmo.(s) Sr.(s)</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedInvoiceToView.customerName}</span>
                  <span className="text-slate-600 text-[11px] block">{selectedInvoiceToView.customerAddress || 'Luanda, Angola'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">NIF do Adquirente</span>
                  <span className="font-mono font-bold text-slate-800 text-xs block">{selectedInvoiceToView.customerNif}</span>
                  <span className="text-slate-600 text-[11px] block mt-1">Forma de Pagamento: {selectedInvoiceToView.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2">Código</th>
                    <th className="py-2">Descrição</th>
                    <th className="py-2 text-center">Qtd</th>
                    <th className="py-2 text-right">P. Unitário</th>
                    <th className="py-2 text-center">Taxa IVA</th>
                    <th className="py-2 text-right">Total (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoiceToView.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 font-mono text-[11px] text-slate-600">{it.sku}</td>
                      <td className="py-2.5 font-medium text-slate-900">{it.productName}</td>
                      <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2.5 text-center font-mono">{it.taxRate}%</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Fiscal Signoff */}
              <div className="flex justify-between items-end border-t pt-4">
                <div className="space-y-1 text-[10px] text-slate-500 max-w-xs">
                  <p className="font-semibold text-slate-700">Regime Geral do IVA - 14%</p>
                  <p>Processado por programa validado nº 0092/AGT/2026 (Inventa KAF ERP)</p>
                  <p className="font-mono text-[9px]">Hash: 87b2-c7f1-a1e4-99d0-2026</p>
                </div>

                <div className="w-56 space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Incidência:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceToView.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA Liquidado (14%):</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceToView.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-indigo-900 pt-2 border-t-2 border-slate-900">
                    <span>Total Kz:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceToView.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              Anular Fatura & Estornar Estoque
            </h3>
            <p className="text-xs text-slate-300">
              O cancelamento irá restabelecer automaticamente as quantidades no estoque e registrar a nota de crédito na auditoria.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Motivo da Anulação:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalInvoiceId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
              >
                Confirmar Anulação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
