import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  DollarSign,
  CreditCard,
  User,
  Scan,
  Printer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, PaymentMethod, Invoice } from '../../types';
import { playScannerBeep } from '../../utils/audio';
import { formatCurrency } from '../../utils/formatters';

interface QuickSalePOSProps {
  onViewInvoice: (invoice: Invoice) => void;
}

export const QuickSalePOS: React.FC<QuickSalePOSProps> = ({ onViewInvoice }) => {
  const {
    products,
    customers,
    selectedWarehouseId,
    issueInvoice,
    findProductByCode,
    getProductStock,
    openScannerModal,
    currentUser,
  } = useApp();

  const [basket, setBasket] = useState<{ product: Product; quantity: number }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[2]?.id || customers[0]?.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TPA_MULTICAIXA');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [lastIssuedInvoice, setLastIssuedInvoice] = useState<Invoice | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleAddProductToBasket = (prod: Product) => {
    playScannerBeep('success');
    setBasket((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { product: prod, quantity: 1 }];
      }
    });
  };

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = findProductByCode(barcodeInput.trim());
    if (found) {
      handleAddProductToBasket(found);
      setBarcodeInput('');
    } else {
      playScannerBeep('error');
      alert(`Produto com código "${barcodeInput}" não encontrado!`);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setBasket((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setBasket((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Basket totals
  const subtotal = basket.reduce((s, i) => s + i.quantity * i.product.sellingPrice, 0);
  const tax = basket.reduce((s, i) => s + (i.quantity * i.product.sellingPrice * (i.product.taxRate || 14)) / 100, 0);
  const grandTotal = subtotal + tax;
  const changeDue = paymentMethod === 'DINHEIRO' && cashTendered > grandTotal ? cashTendered - grandTotal : 0;

  const handleCompleteSale = () => {
    if (basket.length === 0) return;

    const items = basket.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      taxRate: item.product.taxRate || 14,
    }));

    const invoice = issueInvoice({
      type: 'FATURA_SIMPLIFICADA',
      customerId: selectedCustomerId,
      warehouseId: selectedWarehouseId,
      paymentMethod,
      items,
      notes: `Venda Rápida no PDV por ${currentUser.name}`,
    });

    playScannerBeep('success');
    setLastIssuedInvoice(invoice);
    setBasket([]);
    setCashTendered(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Modo Venda Rápida / Ponto de Venda (PDV)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro acelerado via código de barras com baixa imediata no estoque e emissão de recibo
          </p>
        </div>

        <button
          onClick={() => openScannerModal('LOOKUP')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Scan className="w-4 h-4 text-indigo-400" />
          <span>Ativar Leitor de Câmera</span>
        </button>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection & Barcode Reader */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode scanner input field */}
          <form
            onSubmit={handleBarcodeSubmit}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2"
          >
            <Barcode className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Aponte o scanner USB/Bluetooth ou digite o código de barras..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-transparent text-white font-mono text-sm placeholder:text-slate-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
            >
              Adicionar
            </button>
          </form>

          {/* Quick Click Catalog Grid */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Toque Rápido para Adicionar ao Carrinho:
              </span>
              <span>{products.length} itens</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {products.map((prod) => {
                const stock = getProductStock(prod.id, selectedWarehouseId);
                const isOutOfStock = stock <= 0;

                return (
                  <button
                    key={prod.id}
                    disabled={isOutOfStock}
                    onClick={() => handleAddProductToBasket(prod)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'opacity-40 bg-slate-950 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-xs line-clamp-2">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {prod.barcode}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {formatCurrency(prod.sellingPrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {stock} {prod.unit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Basket & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Basket Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Carrinho de Compras</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {basket.reduce((s, i) => s + i.quantity, 0)} itens
                </span>
              </div>

              {/* Basket Items List */}
              <div className="space-y-2 py-3 max-h-60 overflow-y-auto">
                {basket.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <ShoppingCart className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    Carrinho vazio. Escaneie produtos para começar a venda.
                  </div>
                ) : (
                  basket.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{item.product.name}</div>
                        <div className="text-[11px] text-emerald-400 font-mono font-bold">
                          {formatCurrency(item.product.sellingPrice)}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checkout Options & Totals */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              {/* Customer and Payment Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cliente:</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs cursor-pointer"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Forma de Pagamento:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs cursor-pointer"
                  >
                    <option value="TPA_MULTICAIXA">TPA Multicaixa</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </select>
                </div>
              </div>

              {/* Cash tendered input if cash */}
              {paymentMethod === 'DINHEIRO' && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Valor Entregue:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Valor Kz"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono text-xs"
                    />
                    {changeDue > 0 && (
                      <span className="text-emerald-400 font-bold font-mono text-xs">
                        Troco: {formatCurrency(changeDue)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA (14%):</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-white pt-1 border-t border-slate-800">
                  <span>Total Geral:</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                disabled={basket.length === 0}
                onClick={handleCompleteSale}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  basket.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Finalizar Venda & Emitir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Sale Success and Receipt Ready */}
      {lastIssuedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Documento emitido: <span className="font-mono text-slate-200 font-bold">{lastIssuedInvoice.number}</span>
              </p>
              <p className="text-base font-bold text-emerald-400 font-mono mt-1">
                {formatCurrency(lastIssuedInvoice.total)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Baixa de estoque efetuada e caixa atualizado automaticamente.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  onViewInvoice(lastIssuedInvoice);
                  setLastIssuedInvoice(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Recibo
              </button>
              <button
                onClick={() => setLastIssuedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Próxima Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
