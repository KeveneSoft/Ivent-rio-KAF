import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  User,
  Barcode,
  Camera,
  Smartphone,
  ShieldAlert,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const AuditView: React.FC = () => {
  const { auditEvents, users } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');

  const filteredEvents = auditEvents.filter((ev) => {
    const matchesSearch =
      ev.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.productName && ev.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.documentRef && ev.documentRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.details && ev.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDevice = deviceFilter === 'ALL' || ev.deviceUsed === deviceFilter;
    const matchesUser = userFilter === 'ALL' || ev.userId === userFilter;

    return matchesSearch && matchesDevice && matchesUser;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Auditoria Central de Leituras & Operações (Seção 15 e 24)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rastreabilidade completa de todas as leituras de código de barras, QR Code, inventários e transações
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
          Total de registros: <span className="text-white font-bold">{auditEvents.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por ação, operador, produto, estante ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Device Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Barcode className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Todos os Dispositivos</option>
              <option value="Scanner USB" className="bg-slate-900">Scanner USB</option>
              <option value="Scanner Bluetooth" className="bg-slate-900">Scanner Bluetooth</option>
              <option value="Câmera Smartphone" className="bg-slate-900">Câmera Smartphone</option>
              <option value="Teclado / Simulador" className="bg-slate-900">Teclado / Simulador</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Todos os Operadores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Operador & Dispositivo</th>
                <th className="py-3 px-4">Ação / Módulo</th>
                <th className="py-3 px-4">Item / Referência</th>
                <th className="py-3 px-4">Detalhes da Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(ev.timestamp)}
                    </td>

                    {/* Operator & Device */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ev.userName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        {ev.deviceUsed.includes('Scanner') ? (
                          <Barcode className="w-3 h-3 text-indigo-400" />
                        ) : ev.deviceUsed.includes('Câmera') ? (
                          <Camera className="w-3 h-3 text-sky-400" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>{ev.deviceUsed}</span>
                      </div>
                    </td>

                    {/* Action & Module */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block text-xs">{ev.action}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-950 border border-slate-800 text-slate-400 mt-0.5 inline-block">
                        {ev.operation}
                      </span>
                    </td>

                    {/* Item & Reference */}
                    <td className="py-3 px-4">
                      {ev.productName && (
                        <div className="font-medium text-white">{ev.productName}</div>
                      )}
                      {ev.productCode && (
                        <div className="font-mono text-[10px] text-slate-400">
                          Cód: {ev.productCode}
                        </div>
                      )}
                      {ev.documentRef && (
                        <div className="font-mono text-[10px] text-indigo-400">
                          Ref: {ev.documentRef}
                        </div>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                      {ev.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
