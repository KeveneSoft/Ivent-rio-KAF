import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Barcode,
  QrCode,
  AlertTriangle,
  Printer,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProductsListProps {
  onPrintLabel: (product: Product) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ onPrintLabel }) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductStock,
    getProductLocationInfo,
    selectedWarehouseId,
    openScannerModal,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'ZERO'>('ALL');

  // Modal State for New/Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    qrCode: '',
    internalCode: '',
    category: 'Informática & Hardware',
    unit: 'un',
    costPrice: 0,
    sellingPrice: 0,
    minStock: 5,
    taxRate: 14,
    requiresSerial: false,
    hasBatch: false,
    description: '',
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const randCode = Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData({
      name: '',
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      barcode: randCode,
      qrCode: `QR-PROD-${randCode}`,
      internalCode: `INT-${randCode.slice(-4)}`,
      category: 'Informática & Hardware',
      unit: 'un',
      costPrice: 50000,
      sellingPrice: 75000,
      minStock: 5,
      taxRate: 14,
      requiresSerial: false,
      hasBatch: false,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      qrCode: product.qrCode,
      internalCode: product.internalCode,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      minStock: product.minStock,
      taxRate: product.taxRate,
      requiresSerial: !!product.requiresSerial,
      hasBatch: !!product.hasBatch,
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData,
      });
    } else {
      addProduct({
        ...formData,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    const stock = getProductStock(p.id, selectedWarehouseId);
    const matchesStock =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'LOW'
        ? stock > 0 && stock <= p.minStock
        : stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Catálogo de Produtos & Controle de Estoque
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento por SKU, Código de Barras, QR Code, Lotes e Números de Série
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openScannerModal('LOOKUP')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4 text-indigo-400" />
            <span>Consultar Scanner</span>
          </button>
          <button
            id="add-product-btn"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, SKU, código de barras ou QR Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                stockFilter === 'ALL' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                stockFilter === 'LOW' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estoque Baixo
            </button>
            <button
              onClick={() => setStockFilter('ZERO')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                stockFilter === 'ZERO' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Zerados
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Produto & Códigos</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Localização Atual</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Preço de Venda</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = getProductStock(p.id, selectedWarehouseId);
                  const locInfo = getProductLocationInfo(p.id, selectedWarehouseId);
                  const isLow = stock > 0 && stock <= p.minStock;
                  const isZero = stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Product & Codes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{p.name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                            SKU: {p.sku}
                          </span>
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-indigo-400" />
                            {p.barcode}
                          </span>
                          {p.requiresSerial && (
                            <span className="bg-sky-950/60 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                              Serial
                            </span>
                          )}
                          {p.hasBatch && (
                            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                              Lote
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-400">{p.category}</td>

                      {/* Current Location */}
                      <td className="py-3.5 px-4">
                        {locInfo?.location ? (
                          <div className="font-mono text-[11px] text-emerald-400">
                            {locInfo.warehouse?.name} → {locInfo.location.rack}/{locInfo.location.shelf} ({locInfo.location.bin})
                          </div>
                        ) : (
                          <span className="text-amber-400/80 text-[11px]">Não alocado</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                            isZero
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {stock} {p.unit}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Mín: {p.minStock} {p.unit}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(p.sellingPrice)}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Custo: {formatCurrency(p.costPrice)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Label */}
                          <button
                            onClick={() => onPrintLabel(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Imprimir Etiquetas (Código de Barras / QR)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {/* Quick Inbound */}
                          <button
                            onClick={() => openScannerModal('INBOUND')}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-400 hover:text-white border border-emerald-800/60 transition-colors"
                            title="Entrada com Scanner"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Editar Produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir o produto "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition-colors"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Notebook HP ProBook 450 G9"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Código de Barras *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">QR Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.qrCode}
                    onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Unidade de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="cx">cx (Caixa)</option>
                    <option value="kg">kg (Quilograma)</option>
                    <option value="m">m (Metro)</option>
                    <option value="l">l (Litro)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Preço de Custo (Kz)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Preço de Venda (Kz)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Taxa IVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresSerial}
                    onChange={(e) => setFormData({ ...formData, requiresSerial: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Rastrear por Número de Série</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBatch}
                    onChange={(e) => setFormData({ ...formData, hasBatch: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Rastrear por Lote</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
