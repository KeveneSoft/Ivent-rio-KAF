import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { UniversalScannerModal } from './components/scanner/UniversalScannerModal';
import { StockDashboard } from './components/dashboard/StockDashboard';
import { FinanceDashboard } from './components/dashboard/FinanceDashboard';
import { ProductsList } from './components/inventory/ProductsList';
import { WarehouseHierarchyView } from './components/inventory/WarehouseHierarchyView';
import { PhysicalInventoryView } from './components/inventory/PhysicalInventoryView';
import { AssetsView } from './components/assets/AssetsView';
import { InvoicingView } from './components/invoicing/InvoicingView';
import { QuickSalePOS } from './components/pos/QuickSalePOS';
import { FinanceView } from './components/finance/FinanceView';
import { AuditView } from './components/audit/AuditView';
import { LabelGeneratorModal } from './components/labels/LabelGeneratorModal';
import { UsersPermissionsModal } from './components/users/UsersPermissionsModal';
import { Product, WarehouseLocation, Asset } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard-stock');

  // Modals state
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelTargetProduct, setLabelTargetProduct] = useState<Product | null>(null);
  const [labelTargetLocation, setLabelTargetLocation] = useState<WarehouseLocation | null>(null);
  const [labelTargetAsset, setLabelTargetAsset] = useState<Asset | null>(null);

  // Label openers
  const handleOpenProductLabel = (product: Product) => {
    setLabelTargetProduct(product);
    setLabelTargetLocation(null);
    setLabelTargetAsset(null);
    setIsLabelModalOpen(true);
  };

  const handleOpenLocationLabel = (location: WarehouseLocation) => {
    setLabelTargetLocation(location);
    setLabelTargetProduct(null);
    setLabelTargetAsset(null);
    setIsLabelModalOpen(true);
  };

  const handleOpenAssetLabel = (asset: Asset) => {
    setLabelTargetAsset(asset);
    setLabelTargetProduct(null);
    setLabelTargetLocation(null);
    setIsLabelModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Offline Alert Banner */}
      <OfflineIndicator />

      {/* Main App Top Header */}
      <Header
        onOpenQuickPOS={() => setActiveTab('pos')}
        onOpenUserPermissions={() => setIsUserPermissionsOpen(true)}
      />

      {/* Main Body with Sidebar and Content View */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab === 'labels' ? 'products' : activeTab}
          setActiveTab={(tab) => {
            if (tab === 'labels') {
              setIsLabelModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          onOpenUserPermissions={() => setIsUserPermissionsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard-stock' && (
              <StockDashboard onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'dashboard-finance' && (
              <FinanceDashboard onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'products' && (
              <ProductsList onPrintLabel={handleOpenProductLabel} />
            )}

            {activeTab === 'warehouses' && (
              <WarehouseHierarchyView onPrintLocationLabel={handleOpenLocationLabel} />
            )}

            {activeTab === 'inventory' && <PhysicalInventoryView />}

            {activeTab === 'assets' && (
              <AssetsView onPrintAssetLabel={handleOpenAssetLabel} />
            )}

            {activeTab === 'invoicing' && <InvoicingView />}

            {activeTab === 'pos' && (
              <QuickSalePOS onViewInvoice={() => setActiveTab('invoicing')} />
            )}

            {activeTab === 'finance' && <FinanceView />}

            {activeTab === 'audit' && <AuditView />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <UniversalScannerModal />

      <LabelGeneratorModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        targetProduct={labelTargetProduct}
        targetLocation={labelTargetLocation}
        targetAsset={labelTargetAsset}
      />

      <UsersPermissionsModal
        isOpen={isUserPermissionsOpen}
        onClose={() => setIsUserPermissionsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
