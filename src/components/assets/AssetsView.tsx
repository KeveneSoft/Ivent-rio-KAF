import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  QrCode,
  Printer,
  Clock,
  User,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AssetsViewProps {
  onPrintAssetLabel: (asset: Asset) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ onPrintAssetLabel }) => {
  const { assets, addAsset, updateAssetStatus, currentUser, openScannerModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EM_USO' | 'MANUTENCAO' | 'DISPONIVEL'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null);

  // New Asset Modal
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [department, setDepartment] = useState('Logística & Expedição');
  const [location, setLocation] = useState('Armazém Central - Sala de Triagem');
  const [responsiblePerson, setResponsiblePerson] = useState('João Manuel');

  // Status Change Dialog
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Asset['status']>('MANUTENCAO');
  const [statusNotes, setStatusNotes] = useState('');

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;

    const count = assets.length + 1;
    const code = `PAT-${String(count).padStart(6, '0')}`;

    const created = addAsset({
      name: assetName,
      assetCode: code,
      qrCode: `${code}-${serialNumber || 'SN'}`,
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      category: 'Equipamento de Operação',
      department,
      location,
      responsiblePerson,
      status: 'DISPONIVEL',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionValue: 250000,
      currentValue: 250000,
    });

    setIsNewAssetModalOpen(false);
    setSelectedAsset(created);
    setAssetName('');
    setSerialNumber('');
  };

  const handleApplyStatusChange = () => {
    if (!selectedAsset) return;
    updateAssetStatus(selectedAsset.id, newStatus, statusNotes || 'Atualização de rotina operacional');
    setIsStatusDialogOpen(false);
    setStatusNotes('');
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Controle de Ativos & Equipamentos (Seção 23)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rastreamento patrimonial com QR Code, número de série, responsável e histórico de manutenção
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openScannerModal('LOOKUP')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Escanear Ativo</span>
          </button>
          <button
            onClick={() => setIsNewAssetModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Ativo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, código patrimonial (PAT), serial ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'EM_USO', 'MANUTENCAO', 'DISPONIVEL'] as const).map((st) => (
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
              {st === 'EM_USO' && 'Em Uso'}
              {st === 'MANUTENCAO' && 'Manutenção'}
              {st === 'DISPONIVEL' && 'Disponível'}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Layout: Assets List & Selected Asset Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Cards */}
        <div className="lg:col-span-7 space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              Nenhum equipamento cadastrado corresponde aos critérios.
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{asset.assetCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          asset.status === 'EM_USO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : asset.status === 'MANUTENCAO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {asset.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm truncate">{asset.name}</h3>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span>Serial: <span className="font-mono text-slate-300">{asset.serialNumber}</span></span>
                      <span>•</span>
                      <span>Resp: {asset.responsiblePerson}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintAssetLabel(asset);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Imprimir Etiqueta Patrimonial com QR"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Asset Detailed History / Lifecycle */}
        <div className="lg:col-span-5">
          {selectedAsset ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 sticky top-20">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    Ficha Patrimonial do Ativo
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedAsset.name}</h3>
                  <div className="font-mono text-xs text-slate-400 mt-0.5">
                    Patrimônio: <span className="text-white font-bold">{selectedAsset.assetCode}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsStatusDialogOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Alterar Estado</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Número de Série</span>
                  <span className="font-mono font-bold text-white">{selectedAsset.serialNumber}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Departamento</span>
                  <span className="font-semibold text-white">{selectedAsset.department}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Localização Físico-Interna</span>
                  <span className="font-semibold text-white">{selectedAsset.location}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Responsável Atual</span>
                  <span className="font-semibold text-white">{selectedAsset.responsiblePerson}</span>
                </div>
              </div>

              {/* QR Tag Visualizer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      {selectedAsset.qrCode}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Escaneável por smartphones ou coletores
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onPrintAssetLabel(selectedAsset)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg font-medium cursor-pointer"
                >
                  Imprimir
                </button>
              </div>

              {/* Lifecycle Timeline */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Histórico de Vida & Manutenções:</span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedAsset.history.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200">{h.action}</span>
                        <span className="text-slate-500 font-mono">{formatDate(h.date)}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{h.notes}</p>
                      <div className="text-[10px] text-slate-500">
                        Responsável: <span className="text-slate-300">{h.responsible}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              Selecione um ativo para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>

      {/* New Asset Modal */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Cadastrar Equipamento / Ativo Patrimonial
            </h3>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Descrição do Ativo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leitor de Código de Barras Honeywell 1900G"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Número de Série (Serial) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5CD123456HP"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Responsável</label>
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Localização Físico-Interna</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAssetModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Cadastrar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {isStatusDialogOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Atualizar Estado do Ativo ({selectedAsset.assetCode})
            </h3>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Novo Estado:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Asset['status'])}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="EM_USO">EM USO</option>
                <option value="MANUTENCAO">MANUTENÇÃO</option>
                <option value="DISPONIVEL">DISPONÍVEL</option>
                <option value="BAIXADO">BAIXADO / OBSOLETO</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Notas da Ocorrência:</label>
              <textarea
                rows={2}
                placeholder="Ex: Enviado para assistência técnica ou realocado..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsStatusDialogOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyStatusChange}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Salvar Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
