import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  QrCode,
  Package,
  Plus,
  Printer,
  ChevronRight,
  Warehouse as WarehouseIcon,
  User,
  Barcode,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WarehouseLocation } from '../../types';

interface WarehouseHierarchyViewProps {
  onPrintLocationLabel: (location: WarehouseLocation) => void;
}

export const WarehouseHierarchyView: React.FC<WarehouseHierarchyViewProps> = ({
  onPrintLocationLabel,
}) => {
  const {
    warehouses,
    locations,
    stockLocations,
    products,
    selectedWarehouseId,
    setSelectedWarehouseId,
    openScannerModal,
  } = useApp();

  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  const warehouseLocations = locations.filter((l) => l.warehouseId === selectedWarehouseId);

  const areas = Array.from(new Set(warehouseLocations.map((l) => l.area)));

  const filteredLocations = warehouseLocations.filter((l) => {
    const matchesArea = selectedArea === 'ALL' || l.area === selectedArea;
    const matchesSearch =
      l.code.toLowerCase().includes(searchLocation.toLowerCase()) ||
      l.rack.toLowerCase().includes(searchLocation.toLowerCase()) ||
      l.shelf.toLowerCase().includes(searchLocation.toLowerCase()) ||
      l.bin.toLowerCase().includes(searchLocation.toLowerCase()) ||
      l.area.toLowerCase().includes(searchLocation.toLowerCase());

    return matchesArea && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Hierarquia de Armazéns & Endereçamento Físico
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estrutura visual: Armazém → Área → Estante → Prateleira → Posição (com QR Codes)
          </p>
        </div>

        <button
          onClick={() => openScannerModal('LOCATION_ASSIGN')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Escanear QR de Estante</span>
        </button>
      </div>

      {/* Warehouse Selection Bar */}
      <div className="flex flex-wrap gap-2">
        {warehouses.map((wh) => (
          <button
            key={wh.id}
            onClick={() => setSelectedWarehouseId(wh.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedWarehouseId === wh.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <WarehouseIcon className="w-3.5 h-3.5" />
            <span>{wh.name}</span>
            <span className="text-[10px] opacity-75 font-normal">({wh.city})</span>
          </button>
        ))}
      </div>

      {/* Filters: Area & Search */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedArea('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedArea === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas as Áreas
          </button>
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedArea(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedArea === a ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar estante ou posição..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((loc) => {
          // Find products in this exact location
          const itemsAtLocation = stockLocations.filter(
            (sl) => sl.warehouseId === loc.warehouseId && sl.locationId === loc.id && sl.quantity > 0
          );

          return (
            <div
              key={loc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                    {loc.area}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Estante {loc.rack} • Prat. {loc.shelf}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Posição / Caixa: <span className="font-semibold text-white font-mono">{loc.bin}</span>
                  </div>
                </div>

                <button
                  onClick={() => onPrintLocationLabel(loc)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Imprimir Etiqueta QR desta Estante"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code Identification Tag */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-[11px] text-slate-300">{loc.qrCode}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {loc.code}
                </span>
              </div>

              {/* Stored Products List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Itens Armazenados:</span>
                  <span className="text-slate-500 font-mono">
                    {itemsAtLocation.reduce((s, i) => s + i.quantity, 0)} unidades
                  </span>
                </div>

                {itemsAtLocation.length === 0 ? (
                  <div className="py-3 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-lg">
                    Posição vazia (disponível para alocação)
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {itemsAtLocation.map((it) => {
                      const prod = products.find((p) => p.id === it.productId);
                      if (!prod) return null;
                      return (
                        <div
                          key={it.id}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-white block truncate">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-emerald-400 font-mono text-xs">
                              {it.quantity} {prod.unit}
                            </span>
                            {it.batchNumber && (
                              <span className="block text-[9px] text-slate-500 font-mono">
                                {it.batchNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Responsible footer */}
              {loc.responsible && (
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Responsável pelo setor: {loc.responsible}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
