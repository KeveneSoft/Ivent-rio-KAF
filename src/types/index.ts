export type UserRole = 'ADMIN' | 'OPERATOR_STOCK' | 'OPERATOR_INVOICE' | 'AUDITOR';

export interface UserPermissions {
  viewProducts: boolean;
  createProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  stockIn: boolean;
  stockOut: boolean;
  stockTransfer: boolean;
  physicalInventory: boolean;
  approveInventoryAdjustment: boolean;
  issueInvoice: boolean;
  cancelInvoice: boolean;
  viewFinance: boolean;
  manageFinance: boolean;
  viewAssets: boolean;
  manageAssets: boolean;
  viewAudit: boolean;
  manageUsers: boolean;
  editPrices?: boolean;
  viewCostPrice?: boolean;
  performInventoryCount?: boolean;
  applyDiscounts?: boolean;
  viewFinancialReports?: boolean;
  viewAccountingLedger?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  permissions: UserPermissions;
}

export type ScanDeviceType = 'Scanner USB' | 'Scanner Bluetooth' | 'Câmera Smartphone' | 'Teclado / Simulador';

export interface Product {
  id: string;
  name: string;
  sku: string;
  internalCode: string;
  barcode: string;
  qrCode: string;
  category: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // e.g. 14 for 14%
  minStock: number;
  unit: string;
  requiresSerial: boolean;
  hasBatch: boolean;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  manager: string;
  isActive: boolean;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  area: string; // e.g. "Informática", "Área A", "Logística"
  rack: string; // Estante, e.g. "E-03"
  shelf: string; // Prateleira, e.g. "P-02"
  bin: string; // Posição, e.g. "02-B"
  code: string; // e.g. "E03-P02-02B"
  qrCode: string; // e.g. "LOC-ARMC-E03-P02-02B"
  responsible: string;
}

export interface ProductStockLocation {
  id: string;
  productId: string;
  warehouseId: string;
  locationId: string;
  quantity: number;
  batchNumber?: string;
  serialNumber?: string;
  lastVerifiedAt: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'SALE_DEDUCTION';
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  documentRef?: string;
  userId: string;
  userName: string;
  notes?: string;
  deviceUsed: ScanDeviceType;
}

export type InvoiceType = 
  | 'FATURA' 
  | 'FATURA_SIMPLIFICADA' 
  | 'ORCAMENTO' 
  | 'NOTA_CREDITO' 
  | 'NOTA_DEBITO' 
  | 'RECIBO'
  | 'VENDA_DINHEIRO';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'DINHEIRO' | 'TPA_MULTICAIXA' | 'TRANSFERENCIA' | 'A_PRAZO';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  discountRate: number; // percentage
  taxRate: number; // percentage (e.g. 14%)
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  number: string; // e.g. "FT 2026/0094"
  series: string; // e.g. "FT 2026"
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerNif: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  warehouseId: string;
  warehouseName: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  issuedByUserId: string;
  issuedByUserName: string;
  status: InvoiceStatus;
  stockDeducted: boolean;
  financialRecorded: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
}

export interface Supplier {
  id: string;
  name: string;
  nif: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
}

export interface InventoryCountItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  locationCode: string;
  systemQty: number;
  countedQty: number;
  difference: number; // countedQty - systemQty
  status: 'PENDING' | 'MATCH' | 'SURPLUS' | 'DEFICIT';
  lastScannedAt?: string;
  scannedBy?: string;
}

export interface InventorySession {
  id: string;
  code: string; // e.g. "INV-2026-0098"
  title: string;
  warehouseId: string;
  warehouseName: string;
  status: 'OPEN' | 'COUNTING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  startedAt: string;
  completedAt?: string;
  supervisorId: string;
  supervisorName: string;
  items: InventoryCountItem[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Asset {
  id: string;
  assetCode: string; // e.g. "PAT-000542"
  name: string;
  category: string;
  serialNumber: string;
  qrCode: string;
  department: string;
  location: string;
  responsiblePerson: string;
  status: 'EM_USO' | 'EM_ESTOQUE' | 'MANUTENCAO' | 'BAIXADO' | 'DISPONIVEL';
  acquisitionDate: string;
  acquisitionValue: number;
  currentValue: number;
  history: {
    id: string;
    date: string;
    action: string;
    responsible: string;
    notes: string;
  }[];
}

export interface AccountPayable {
  id: string;
  supplierId: string;
  supplierName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  invoiceRef?: string;
  category: string;
  paidAt?: string;
}

export interface AccountReceivable {
  id: string;
  customerId: string;
  customerName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE';
  invoiceId?: string;
  invoiceNumber?: string;
  receivedAt?: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'CAIXA' | 'BANCO';
  bankName?: string;
  accountNumber?: string;
  balance: number;
  currency: string; // e.g. "Kz" (Kwanzas) or "€" or "$"
}

export interface AccountingEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  documentRef?: string;
  autoGenerated: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string; // e.g. "LEITURA DE PRODUTO", "EMISSAO_FATURA", "BAIXA_ESTOQUE", "AJUSTE_INVENTARIO"
  operation: string; // "Inventário", "Faturação", "Estoque", "Ativos", "Sistema"
  productName?: string;
  productCode?: string;
  warehouseName?: string;
  locationCode?: string;
  quantity?: number;
  deviceUsed: ScanDeviceType;
  documentRef?: string;
  details: string;
}
