import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  QrCode,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  MapPin,
  Package,
  Layers,
  Sparkles,
  Smartphone,
  Radio,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScanDeviceType, Product, WarehouseLocation, Asset } from '../../types';
import { playScannerBeep } from '../../utils/audio';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const UniversalScannerModal: React.FC = () => {
  const {
    scannerModal,
    closeScannerModal,
    products,
    locations,
    warehouses,
    assets,
    findProductByCode,
    findLocationByCode,
    findAssetByCode,
    getProductStock,
    getProductLocationInfo,
    performStockIn,
    performStockOut,
    assignProductLocation,
    recordInventoryCountItem,
    inventorySessions,
    currentUser,
  } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [activeDevice, setActiveDevice] = useState<ScanDeviceType>('Câmera Smartphone');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scan Result State
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scannedLocation, setScannedLocation] = useState<WarehouseLocation | null>(null);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Operation specific fields
  const [operationQty, setOperationQty] = useState<number>(1);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [outboundReason, setOutboundReason] = useState('Saída para expedição / cliente');
  const [batchInput, setBatchInput] = useState('');
  const [serialInput, setSerialInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Focus input automatically
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (scannerModal.isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      // Reset local states
      setInputCode('');
      setScannedProduct(null);
      setScannedLocation(null);
      setScannedAsset(null);
      setActionSuccessMsg(null);
      setOperationQty(1);
    } else {
      stopCamera();
    }
  }, [scannerModal.isOpen, scannerModal.mode]);

  // Camera stream handler
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setCameraError('Não foi possível acessar a câmera. Use os leitores USB/Bluetooth ou simulador.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualScan = (codeToScan?: string, deviceType: ScanDeviceType = activeDevice) => {
    const rawCode = (codeToScan !== undefined ? codeToScan : inputCode).trim();
    if (!rawCode) return;

    playScannerBeep('success');
    setActionSuccessMsg(null);

    // 1. Check if it's a product
    const prod = findProductByCode(rawCode);
    // 2. Check if it's a location QR
    const loc = findLocationByCode(rawCode);
    // 3. Check if it's an asset code
    const ast = findAssetByCode(rawCode);

    if (prod) {
      setScannedProduct(prod);
      setScannedAsset(null);
      const locInfo = getProductLocationInfo(prod.id);
      if (locInfo?.location) {
        setSelectedLocationId(locInfo.location.id);
      } else {
        setSelectedLocationId(locations[0]?.id || '');
      }

      // If in INVENTORY_COUNT mode and session is open, record automatically
      if (scannerModal.mode === 'INVENTORY_COUNT' && scannerModal.targetId) {
        recordInventoryCountItem({
          sessionId: scannerModal.targetId,
          barcodeOrSku: prod.barcode,
          countedQuantity: operationQty,
          locationCode: locInfo?.location?.code,
          deviceUsed: deviceType,
        });
        setActionSuccessMsg(`Contado +${operationQty} un de ${prod.name} na sessão.`);
      }
    } else if (loc) {
      setScannedLocation(loc);
      setActionSuccessMsg(`Localização identificada: ${loc.warehouseName} → Estante ${loc.rack}, Prateleira ${loc.shelf}, Posição ${loc.bin}`);
    } else if (ast) {
      setScannedAsset(ast);
      setScannedProduct(null);
    } else {
      playScannerBeep('error');
      setActionSuccessMsg(`Código "${rawCode}" não encontrado no catálogo.`);
    }

    setInputCode('');
  };

  // Perform Inbound
  const handleConfirmInbound = () => {
    if (!scannedProduct) return;
    const targetLoc = selectedLocationId || locations[0]?.id || 'loc-1';
    const loc = locations.find((l) => l.id === targetLoc);
    performStockIn({
      productId: scannedProduct.id,
      warehouseId: loc?.warehouseId || 'wh-1',
      locationId: targetLoc,
      quantity: operationQty,
      batchNumber: batchInput || undefined,
      serialNumber: serialInput || undefined,
      deviceUsed: activeDevice,
    });
    playScannerBeep('success');
    setActionSuccessMsg(`Entrada de ${operationQty} un de ${scannedProduct.name} realizada com sucesso!`);
    setScannedProduct(null);
  };

  // Perform Outbound
  const handleConfirmOutbound = () => {
    if (!scannedProduct) return;
    performStockOut({
      productId: scannedProduct.id,
      warehouseId: 'wh-1',
      locationId: selectedLocationId || undefined,
      quantity: operationQty,
      reason: outboundReason,
      deviceUsed: activeDevice,
    });
    playScannerBeep('success');
    setActionSuccessMsg(`Saída de ${operationQty} un de ${scannedProduct.name} registrada com sucesso!`);
    setScannedProduct(null);
  };

  // Associate Location to Product (Section 19: Scan Rack QR + Product Barcode)
  const handleAssociateLocation = () => {
    if (!scannedProduct || !scannedLocation) return;
    assignProductLocation({
      productId: scannedProduct.id,
      warehouseId: scannedLocation.warehouseId,
      locationId: scannedLocation.id,
      deviceUsed: activeDevice,
    });
    playScannerBeep('success');
    setActionSuccessMsg(`Produto ${scannedProduct.name} alocado com sucesso em: ${scannedLocation.warehouseName} → ${scannedLocation.rack}/${scannedLocation.shelf}/${scannedLocation.bin}`);
  };

  if (!scannerModal.isOpen) return null;

  const activeSession = scannerModal.targetId
    ? inventorySessions.find((s) => s.id === scannerModal.targetId)
    : null;

  return (
    <div
      id="universal-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Scanner Inteligente Inventa KAF
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {scannerModal.mode === 'LOOKUP' && 'Pesquisa Rápida'}
                  {scannerModal.mode === 'INBOUND' && 'Entrada de Estoque'}
                  {scannerModal.mode === 'OUTBOUND' && 'Saída de Estoque'}
                  {scannerModal.mode === 'LOCATION_ASSIGN' && 'Leitura de Localização'}
                  {scannerModal.mode === 'INVENTORY_COUNT' && 'Inventário Físico'}
                  {scannerModal.mode === 'QUICK_POS' && 'Venda Rápida / PDV'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Suporta Scanner USB, Bluetooth, Câmera e QR Codes hierárquicos
              </p>
            </div>
          </div>
          <button
            id="close-scanner-modal-btn"
            onClick={closeScannerModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Hardware & Device Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Dispositivo Ativo:
            </span>
            <div className="flex items-center gap-1.5">
              {(['Câmera Smartphone', 'Scanner USB', 'Scanner Bluetooth', 'Teclado / Simulador'] as ScanDeviceType[]).map((dev) => (
                <button
                  key={dev}
                  onClick={() => {
                    setActiveDevice(dev);
                    if (dev === 'Câmera Smartphone' && !cameraActive) {
                      startCamera();
                    } else if (dev !== 'Câmera Smartphone' && cameraActive) {
                      stopCamera();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeDevice === dev
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dev === 'Câmera Smartphone' && <Camera className="w-3 h-3 inline mr-1" />}
                  {dev === 'Scanner USB' && <Barcode className="w-3 h-3 inline mr-1" />}
                  {dev === 'Scanner Bluetooth' && <Smartphone className="w-3 h-3 inline mr-1" />}
                  {dev}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Viewport if Camera selected */}
          {activeDevice === 'Câmera Smartphone' && (
            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 aspect-video flex items-center justify-center">
              {!cameraActive ? (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 mb-3">
                    Pronto para escanear com a câmera do smartphone ou computador
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Ativar Câmera
                  </button>
                  {cameraError && (
                    <p className="mt-2 text-xs text-amber-400 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {cameraError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Targeting frame & laser */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-40 border-2 border-dashed border-sky-400 rounded-xl relative shadow-2xl">
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      <span className="absolute -top-6 inset-x-0 text-center text-[10px] font-bold text-sky-300 uppercase tracking-widest bg-black/60 py-0.5 rounded">
                        Posicione o código no visor
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/90 text-xs"
                  >
                    Desativar Câmera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scanner Input (Receives USB / Bluetooth wedge scanners or manual input) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Leitor de Código de Barras / QR Code:</span>
              <span className="text-[11px] text-indigo-400 font-normal">
                Pressione Enter ou aponte o scanner físico
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  id="scanner-input-field"
                  type="text"
                  placeholder="Escanear código de barras, QR Code, SKU ou Serial..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualScan();
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                id="scanner-submit-btn"
                onClick={() => handleManualScan()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Ler Código
              </button>
            </div>
          </div>

          {/* Quick Test Barcode Simulator Buttons (One-click instant scan presets) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Simulador de Teste Rápido (Clique para escanear):
              </span>
              <span className="text-[10px] text-slate-500">Exemplos reais da especificação</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleManualScan('789456123')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 flex items-center gap-1 font-mono transition-colors"
              >
                <Barcode className="w-3 h-3 text-indigo-400" />
                Notebook HP (789456123)
              </button>
              <button
                onClick={() => handleManualScan('789456124')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 flex items-center gap-1 font-mono transition-colors"
              >
                <Barcode className="w-3 h-3 text-indigo-400" />
                Scanner Honeywell (789456124)
              </button>
              <button
                onClick={() => handleManualScan('LOC-ARMC-E03-P02-02B')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-emerald-300 flex items-center gap-1 font-mono transition-colors"
              >
                <QrCode className="w-3 h-3 text-emerald-400" />
                QR Estante E03/P02 (02-B)
              </button>
              <button
                onClick={() => handleManualScan('PAT-000542-5CD123456')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-amber-300 flex items-center gap-1 font-mono transition-colors"
              >
                <QrCode className="w-3 h-3 text-amber-400" />
                Ativo PAT-000542
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {actionSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Active Inventory Session Header if counting */}
          {activeSession && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
              <div>
                <span className="font-semibold">{activeSession.code}:</span> {activeSession.title}
                <div className="text-[11px] text-indigo-300/80">
                  Armazém: {activeSession.warehouseName} | Supervisor: {activeSession.supervisorName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-300">Qtd Contada:</label>
                <input
                  type="number"
                  min="1"
                  value={operationQty}
                  onChange={(e) => setOperationQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Scanned Location Card (Section 11, 19) */}
          {scannedLocation && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Localização Identificada (Hierarquia de Armazém)
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded">
                  {scannedLocation.code}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Armazém</span>
                  <span className="font-semibold text-white">{scannedLocation.warehouseName}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Área</span>
                  <span className="font-semibold text-white">{scannedLocation.area}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Estante / Prateleira</span>
                  <span className="font-semibold text-white">
                    {scannedLocation.rack} / {scannedLocation.shelf}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Posição / Caixa</span>
                  <span className="font-semibold text-white">{scannedLocation.bin}</span>
                </div>
              </div>

              {scannedProduct && (
                <div className="pt-2 border-t border-slate-700/60 flex justify-end">
                  <button
                    onClick={handleAssociateLocation}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vincular Produto "{scannedProduct.name}" a esta Localização
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scanned Product Card (Section 10: "Identificação automática da localização") */}
          {scannedProduct && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-indigo-500/40 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                    Ficha do Produto Escaneado
                  </span>
                  <h3 className="text-base font-bold text-white">{scannedProduct.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[11px] text-slate-300">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      SKU: {scannedProduct.sku}
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      Cód: {scannedProduct.barcode}
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      QR: {scannedProduct.qrCode}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Preço de Venda</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {formatCurrency(scannedProduct.sellingPrice)}
                  </span>
                </div>
              </div>

              {/* Section 10 Specification Block: "O que é este produto e onde ele está?" */}
              {(() => {
                const locInfo = getProductLocationInfo(scannedProduct.id);
                const currentStock = getProductStock(scannedProduct.id);
                return (
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      Localização Físico-Hierárquica Atual (Seção 10)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Local Atual</span>
                        <span className="font-semibold text-slate-200">
                          {locInfo?.warehouse?.name || 'Armazém Central'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Área</span>
                        <span className="font-semibold text-slate-200">
                          {locInfo?.location?.area || 'Informática'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Estante / Prateleira</span>
                        <span className="font-semibold text-slate-200">
                          {locInfo?.location?.rack || 'E-03'} / {locInfo?.location?.shelf || 'P-02'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Posição</span>
                        <span className="font-semibold text-slate-200">
                          {locInfo?.location?.bin || '02-B'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Responsável</span>
                        <span className="font-semibold text-slate-200">
                          {locInfo?.location?.responsible || 'João Manuel'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Estado</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                          Em estoque
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Quantidade Atual</span>
                        <span className="font-bold text-white text-sm font-mono">
                          {currentStock} {scannedProduct.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Lote / Serial</span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {locInfo?.batchNumber || 'LOTE-2026-A1'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Operations Depending on Modal Mode */}
              {scannerModal.mode === 'INBOUND' && (
                <div className="pt-2 border-t border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    Registrar Entrada no Estoque (Seção 12)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantidade:</label>
                      <input
                        type="number"
                        min="1"
                        value={operationQty}
                        onChange={(e) => setOperationQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Estante / Posição:</label>
                      <select
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.warehouseName} - {l.rack}/{l.shelf} ({l.bin})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Lote / Serial:</label>
                      <input
                        type="text"
                        placeholder="Ex: LOTE-2026-B1"
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleConfirmInbound}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Entrada de Estoque
                    </button>
                  </div>
                </div>
              )}

              {scannerModal.mode === 'OUTBOUND' && (
                <div className="pt-2 border-t border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    Registrar Saída do Estoque (Seção 13)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantidade:</label>
                      <input
                        type="number"
                        min="1"
                        max={getProductStock(scannedProduct.id)}
                        value={operationQty}
                        onChange={(e) => setOperationQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Motivo da Saída:</label>
                      <input
                        type="text"
                        value={outboundReason}
                        onChange={(e) => setOutboundReason(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleConfirmOutbound}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Saída de Estoque
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scanned Asset Card (Section 23: Controle de Equipamentos) */}
          {scannedAsset && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    Ativo Patrimonial Identificado (Seção 23)
                  </span>
                  <h3 className="text-base font-bold text-white">{scannedAsset.name}</h3>
                  <p className="text-xs text-slate-400">Patrimônio: {scannedAsset.assetCode}</p>
                </div>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  {scannedAsset.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Número de Série</span>
                  <span className="font-mono text-white">{scannedAsset.serialNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Departamento</span>
                  <span className="text-white">{scannedAsset.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Localização</span>
                  <span className="text-white">{scannedAsset.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Responsável</span>
                  <span className="text-white">{scannedAsset.responsiblePerson}</span>
                </div>
              </div>

              {/* Asset Timeline */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  Histórico de Vida do Equipamento:
                </span>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {scannedAsset.history.map((h) => (
                    <div key={h.id} className="text-[11px] p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="font-semibold text-slate-200">
                        {formatDate(h.date)} — {h.action}
                      </span>
                      <p className="text-slate-400 mt-0.5">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Operador: <span className="font-semibold text-slate-200">{currentUser.name}</span>
          </div>
          <button
            onClick={closeScannerModal}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
