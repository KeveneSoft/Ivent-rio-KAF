import React, { useState } from 'react';
import {
  Printer,
  QrCode,
  Barcode,
  Package,
  Layers,
  ShieldCheck,
  X,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, WarehouseLocation, Asset } from '../../types';
import { generateBarcodeSvgDataUrl, generateQrSvgDataUrl, formatCurrency } from '../../utils/formatters';

interface LabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
  targetLocation?: WarehouseLocation | null;
  targetAsset?: Asset | null;
}

export const LabelGeneratorModal: React.FC<LabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  targetLocation,
  targetAsset,
}) => {
  const { products, locations, assets } = useApp();

  const [labelType, setLabelType] = useState<'PRODUCT' | 'LOCATION' | 'ASSET'>(
    targetProduct ? 'PRODUCT' : targetLocation ? 'LOCATION' : targetAsset ? 'ASSET' : 'PRODUCT'
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(
    targetProduct?.id || products[0]?.id || ''
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    targetLocation?.id || locations[0]?.id || ''
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    targetAsset?.id || assets[0]?.id || ''
  );

  const [printFormat, setPrintFormat] = useState<'THERMAL' | 'A4_SHEET'>('THERMAL');
  const [copies, setCopies] = useState<number>(1);
  const [showPrice, setShowPrice] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="label-generator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Gerador de Etiquetas (Seção 18)
              </h3>
              <p className="text-xs text-slate-400">
                Impressão de Código de Barras e QR Codes para produtos, estantes e ativos
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

        {/* Modal Controls */}
        <div className="p-5 space-y-4 text-xs">
          {/* Label Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setLabelType('PRODUCT')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                labelType === 'PRODUCT'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produto / Caixa</span>
            </button>
            <button
              onClick={() => setLabelType('LOCATION')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                labelType === 'LOCATION'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Estante / Prateleira</span>
            </button>
            <button
              onClick={() => setLabelType('ASSET')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${
                labelType === 'ASSET'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ativo Patrimonial</span>
            </button>
          </div>

          {/* Item Selector depending on Label Type */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">
              Selecionar {labelType === 'PRODUCT' ? 'Produto' : labelType === 'LOCATION' ? 'Posição de Armazém' : 'Ativo'}:
            </label>
            {labelType === 'PRODUCT' && (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} | Cód: {p.barcode})
                  </option>
                ))}
              </select>
            )}

            {labelType === 'LOCATION' && (
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.warehouseName} → {l.area} (Estante {l.rack}, Prat. {l.shelf}, {l.bin})
                  </option>
                ))}
              </select>
            )}

            {labelType === 'ASSET' && (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.assetCode} - {a.serialNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Print Layout Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-slate-400 font-medium">Formato:</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPrintFormat('THERMAL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    printFormat === 'THERMAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Térmica (100x50mm)
                </button>
                <button
                  onClick={() => setPrintFormat('A4_SHEET')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    printFormat === 'A4_SHEET' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Folha A4 (Grade)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {labelType === 'PRODUCT' && (
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>Exibir Preço</span>
                </label>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Cópias:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Physical Label Live Preview Canvas */}
          <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
            {/* The physical sticker label */}
            <div
              id="printable-sticker-area"
              className="w-80 bg-white text-slate-950 p-4 rounded-lg shadow-xl border border-slate-300 font-sans flex flex-col justify-between"
            >
              {/* Product Label Layout */}
              {labelType === 'PRODUCT' && currentProduct && (
                <div className="space-y-2 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between border-b pb-1">
                    <span>INVENTA KAF</span>
                    <span className="font-mono">SKU: {currentProduct.sku}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-2">
                    {currentProduct.name}
                  </h4>

                  {/* Barcode SVG */}
                  <div className="py-1 flex flex-col items-center justify-center">
                    <img
                      src={generateBarcodeSvgDataUrl(currentProduct.barcode)}
                      alt="Barcode"
                      className="h-12 w-full object-contain"
                    />
                    <span className="font-mono text-[10px] tracking-widest text-slate-700 font-bold mt-0.5">
                      {currentProduct.barcode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t text-[10px]">
                    <div className="flex items-center gap-1 text-left">
                      <img
                        src={generateQrSvgDataUrl(currentProduct.qrCode)}
                        alt="QR"
                        className="w-8 h-8"
                      />
                      <span className="font-mono text-[8px] text-slate-600 block">
                        QR:{currentProduct.qrCode}
                      </span>
                    </div>
                    {showPrice && (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">PVP</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {formatCurrency(currentProduct.sellingPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Shelf Label Layout */}
              {labelType === 'LOCATION' && currentLocation && (
                <div className="space-y-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b pb-1">
                    ENDEREÇO DE ARMAZÉM
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold block">
                      {currentLocation.warehouseName} • {currentLocation.area}
                    </span>
                    <h3 className="font-extrabold text-slate-950 text-base font-mono mt-0.5">
                      {currentLocation.rack} - {currentLocation.shelf}
                    </h3>
                    <span className="text-[11px] font-bold text-indigo-700 font-mono block">
                      Posição: {currentLocation.bin}
                    </span>
                  </div>

                  {/* QR Code for the Rack */}
                  <div className="flex flex-col items-center justify-center py-1">
                    <img
                      src={generateQrSvgDataUrl(currentLocation.qrCode)}
                      alt="Location QR"
                      className="w-20 h-20"
                    />
                    <span className="font-mono text-[9px] font-bold text-slate-800 mt-1">
                      {currentLocation.qrCode}
                    </span>
                  </div>
                </div>
              )}

              {/* Asset Label Layout */}
              {labelType === 'ASSET' && currentAsset && (
                <div className="space-y-2 text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b pb-1 flex justify-between">
                    <span>PATRIMÔNIO CORPORATIVO</span>
                    <span className="font-mono font-bold text-slate-900">{currentAsset.assetCode}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs truncate">{currentAsset.name}</h4>

                  <div className="flex items-center justify-center gap-3 py-1">
                    <img
                      src={generateQrSvgDataUrl(currentAsset.qrCode)}
                      alt="Asset QR"
                      className="w-16 h-16"
                    />
                    <div className="text-left text-[9px] space-y-0.5">
                      <div>Serial: <span className="font-mono font-bold text-slate-800">{currentAsset.serialNumber}</span></div>
                      <div>Setor: <span className="font-semibold text-slate-700">{currentAsset.department}</span></div>
                      <div>Resp: <span className="font-semibold text-slate-700">{currentAsset.responsiblePerson}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiquetas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
