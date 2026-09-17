import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  WarehouseLocation,
  ProductStockLocation,
  StockMovement,
  Invoice,
  Customer,
  Supplier,
  InventorySession,
  Asset,
  AccountPayable,
  AccountReceivable,
  FinancialAccount,
  AccountingEntry,
  AuditEvent,
  UserProfile,
  UserRole,
  UserPermissions,
  ScanDeviceType,
  InvoiceType,
  PaymentMethod,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_LOCATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_INVENTORY_SESSIONS,
  INITIAL_ASSETS,
  INITIAL_ACCOUNTS_PAYABLE,
  INITIAL_ACCOUNTS_RECEIVABLE,
  INITIAL_FINANCIAL_ACCOUNTS,
  INITIAL_ACCOUNTING_ENTRIES,
  INITIAL_AUDIT_EVENTS,
} from '../data/mockInitialData';

export type ScannerModalMode =
  | 'LOOKUP'
  | 'INBOUND'
  | 'OUTBOUND'
  | 'LOCATION_ASSIGN'
  | 'INVOICE_ADD'
  | 'INVENTORY_COUNT'
  | 'QUICK_POS';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  registerUser: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role?: UserRole;
    avatar?: string;
    assignedWarehouseId?: string;
    authProvider?: 'local' | 'google';
  }) => { success: boolean; message?: string; user?: UserProfile };
  loginWithGoogle: (googleData: {
    email: string;
    name: string;
    avatar?: string;
    role?: UserRole;
  }) => { success: boolean; message?: string; user?: UserProfile };
  addUser: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    avatar?: string;
    assignedWarehouseId?: string;
    permissions?: Partial<UserPermissions>;
  }) => { success: boolean; message?: string; user?: UserProfile };
  updateUser: (userId: string, data: Partial<UserProfile>) => { success: boolean; message?: string };
  deleteUser: (userId: string) => { success: boolean; message?: string };
  changeUserPassword: (userId: string, newPassword: string) => { success: boolean; message?: string };
  updateUserPermissions: (userId: string, permissions: Partial<UserProfile['permissions']>) => void;

  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;

  warehouses: Warehouse[];
  locations: WarehouseLocation[];
  products: Product[];
  stockLocations: ProductStockLocation[];
  stockMovements: StockMovement[];
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  inventorySessions: InventorySession[];
  assets: Asset[];
  accountsPayable: AccountPayable[];
  accountsReceivable: AccountReceivable[];
  financialAccounts: FinancialAccount[];
  accountingEntries: AccountingEntry[];
  auditEvents: AuditEvent[];

  // Scanner Modal state
  scannerModal: {
    isOpen: boolean;
    mode: ScannerModalMode;
    targetId?: string; // e.g. inventory session ID or invoice context
  };
  openScannerModal: (mode: ScannerModalMode, targetId?: string) => void;
  closeScannerModal: () => void;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Stock operations
  performStockIn: (params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
    deviceUsed: ScanDeviceType;
    notes?: string;
  }) => void;

  performStockOut: (params: {
    productId: string;
    warehouseId: string;
    locationId?: string;
    quantity: number;
    reason: string;
    deviceUsed: ScanDeviceType;
  }) => void;

  performStockTransfer: (params: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    fromLocationId?: string;
    toLocationId?: string;
    deviceUsed: ScanDeviceType;
  }) => void;

  assignProductLocation: (params: {
    productId: string;
    warehouseId: string;
    locationId: string;
    deviceUsed: ScanDeviceType;
  }) => void;

  // Invoicing operations (Integrated with Stock and Finance)
  issueInvoice: (params: {
    type: InvoiceType;
    customerId: string;
    warehouseId: string;
    paymentMethod: PaymentMethod;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discountRate?: number;
      taxRate?: number;
    }[];
    notes?: string;
    dueDate?: string;
  }) => Invoice;

  cancelInvoice: (invoiceId: string, reason: string) => void;

  // Inventory Count Sessions
  createInventorySession: (title: string, warehouseId: string, notes?: string) => InventorySession;
  recordInventoryCountItem: (params: {
    sessionId: string;
    barcodeOrSku: string;
    countedQuantity: number;
    locationCode?: string;
    deviceUsed: ScanDeviceType;
  }) => boolean;
  submitInventoryForApproval: (sessionId: string) => void;
  approveInventoryAdjustment: (sessionId: string) => void;
  rejectInventorySession: (sessionId: string, reason?: string) => void;

  // Asset operations
  addAsset: (asset: Omit<Asset, 'id' | 'history'>) => Asset;
  updateAssetStatus: (assetId: string, status: Asset['status'], notes: string) => void;

  // Finance operations
  payAccountPayable: (id: string, financialAccountId: string) => void;
  receiveAccountReceivable: (id: string, financialAccountId: string) => void;

  // Audit
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;

  // Helper getters
  getProductStock: (productId: string, warehouseId?: string) => number;
  getProductLocationInfo: (productId: string, warehouseId?: string) => {
    location?: WarehouseLocation;
    warehouse?: Warehouse;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
  } | null;
  findProductByCode: (code: string) => Product | undefined;
  findLocationByCode: (code: string) => WarehouseLocation | undefined;
  findAssetByCode: (code: string) => Asset | undefined;

  // Reset demo
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'inventa_kaf_state_v1';

export const getDefaultPermissionsForRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'ADMIN':
      return {
        viewProducts: true,
        createProduct: true,
        editProduct: true,
        deleteProduct: true,
        stockIn: true,
        stockOut: true,
        stockTransfer: true,
        physicalInventory: true,
        approveInventoryAdjustment: true,
        issueInvoice: true,
        cancelInvoice: true,
        viewFinance: true,
        manageFinance: true,
        viewAssets: true,
        manageAssets: true,
        viewAudit: true,
        manageUsers: true,
        editPrices: true,
        viewCostPrice: true,
        performInventoryCount: true,
        applyDiscounts: true,
        viewFinancialReports: true,
        viewAccountingLedger: true,
      };
    case 'OPERATOR_STOCK':
      return {
        viewProducts: true,
        createProduct: true,
        editProduct: true,
        deleteProduct: false,
        stockIn: true,
        stockOut: true,
        stockTransfer: true,
        physicalInventory: true,
        approveInventoryAdjustment: false,
        issueInvoice: false,
        cancelInvoice: false,
        viewFinance: false,
        manageFinance: false,
        viewAssets: true,
        manageAssets: false,
        viewAudit: false,
        manageUsers: false,
        editPrices: false,
        viewCostPrice: false,
        performInventoryCount: true,
        applyDiscounts: false,
        viewFinancialReports: false,
        viewAccountingLedger: false,
      };
    case 'OPERATOR_INVOICE':
      return {
        viewProducts: true,
        createProduct: false,
        editProduct: false,
        deleteProduct: false,
        stockIn: false,
        stockOut: false,
        stockTransfer: false,
        physicalInventory: false,
        approveInventoryAdjustment: false,
        issueInvoice: true,
        cancelInvoice: false,
        viewFinance: true,
        manageFinance: true,
        viewAssets: false,
        manageAssets: false,
        viewAudit: false,
        manageUsers: false,
        editPrices: false,
        viewCostPrice: false,
        performInventoryCount: false,
        applyDiscounts: true,
        viewFinancialReports: true,
        viewAccountingLedger: false,
      };
    case 'AUDITOR':
      return {
        viewProducts: true,
        createProduct: false,
        editProduct: false,
        deleteProduct: false,
        stockIn: false,
        stockOut: false,
        stockTransfer: false,
        physicalInventory: true,
        approveInventoryAdjustment: false,
        issueInvoice: false,
        cancelInvoice: false,
        viewFinance: true,
        manageFinance: false,
        viewAssets: true,
        manageAssets: false,
        viewAudit: true,
        manageUsers: false,
        editPrices: false,
        viewCostPrice: true,
        performInventoryCount: true,
        applyDiscounts: false,
        viewFinancialReports: true,
        viewAccountingLedger: true,
      };
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const loadSaved = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const loaded = loadSaved<UserProfile[]>('users', INITIAL_USERS);
    return loaded.map((u) => {
      const match = INITIAL_USERS.find((init) => init.id === u.id);
      return {
        ...match,
        ...u,
        username: u.username || match?.username || u.email.split('@')[0],
        password: u.password || match?.password || 'admin123',
        isActive: u.isActive !== undefined ? u.isActive : true,
      };
    });
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = loadSaved<UserProfile | null>('currentUser', null);
    if (saved) {
      const match = INITIAL_USERS.find((init) => init.id === saved.id);
      return {
        ...match,
        ...saved,
        username: saved.username || match?.username || saved.email.split('@')[0],
        password: saved.password || match?.password || 'admin123',
        isActive: saved.isActive !== undefined ? saved.isActive : true,
      };
    }
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadSaved<boolean>('isAuthenticated', false)
  );

  const [warehouses] = useState<Warehouse[]>(() => loadSaved('warehouses', INITIAL_WAREHOUSES));
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-1');
  const [locations, setLocations] = useState<WarehouseLocation[]>(() => loadSaved('locations', INITIAL_LOCATIONS));
  const [products, setProducts] = useState<Product[]>(() => loadSaved('products', INITIAL_PRODUCTS));
  const [stockLocations, setStockLocations] = useState<ProductStockLocation[]>(() =>
    loadSaved('stockLocations', INITIAL_STOCK_LOCATIONS)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadSaved('stockMovements', INITIAL_STOCK_MOVEMENTS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadSaved('invoices', INITIAL_INVOICES));
  const [customers] = useState<Customer[]>(() => loadSaved('customers', INITIAL_CUSTOMERS));
  const [suppliers] = useState<Supplier[]>(() => loadSaved('suppliers', INITIAL_SUPPLIERS));
  const [inventorySessions, setInventorySessions] = useState<InventorySession[]>(() =>
    loadSaved('inventorySessions', INITIAL_INVENTORY_SESSIONS)
  );
  const [assets, setAssets] = useState<Asset[]>(() => loadSaved('assets', INITIAL_ASSETS));
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>(() =>
    loadSaved('accountsPayable', INITIAL_ACCOUNTS_PAYABLE)
  );
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>(() =>
    loadSaved('accountsReceivable', INITIAL_ACCOUNTS_RECEIVABLE)
  );
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(() =>
    loadSaved('financialAccounts', INITIAL_FINANCIAL_ACCOUNTS)
  );
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>(() =>
    loadSaved('accountingEntries', INITIAL_ACCOUNTING_ENTRIES)
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() =>
    loadSaved('auditEvents', INITIAL_AUDIT_EVENTS)
  );

  const [scannerModal, setScannerModal] = useState<{
    isOpen: boolean;
    mode: ScannerModalMode;
    targetId?: string;
  }>({
    isOpen: false,
    mode: 'LOOKUP',
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(isAuthenticated));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_locations`, JSON.stringify(locations));
      localStorage.setItem(`${STORAGE_KEY}_stockLocations`, JSON.stringify(stockLocations));
      localStorage.setItem(`${STORAGE_KEY}_stockMovements`, JSON.stringify(stockMovements));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_inventorySessions`, JSON.stringify(inventorySessions));
      localStorage.setItem(`${STORAGE_KEY}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${STORAGE_KEY}_accountsPayable`, JSON.stringify(accountsPayable));
      localStorage.setItem(`${STORAGE_KEY}_accountsReceivable`, JSON.stringify(accountsReceivable));
      localStorage.setItem(`${STORAGE_KEY}_financialAccounts`, JSON.stringify(financialAccounts));
      localStorage.setItem(`${STORAGE_KEY}_accountingEntries`, JSON.stringify(accountingEntries));
      localStorage.setItem(`${STORAGE_KEY}_auditEvents`, JSON.stringify(auditEvents));
    } catch {
      // LocalStorage full or private browsing
    }
  }, [
    users,
    currentUser,
    isAuthenticated,
    products,
    locations,
    stockLocations,
    stockMovements,
    invoices,
    inventorySessions,
    assets,
    accountsPayable,
    accountsReceivable,
    financialAccounts,
    accountingEntries,
    auditEvents,
  ]);

  const logAuditEvent = (event: Omit<AuditEvent, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      return { success: false, message: 'Por favor, introduza o seu nome de utilizador ou e-mail.' };
    }

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'Utilizador não encontrado no sistema.' };
    }

    if (user.isActive === false) {
      return { success: false, message: 'Esta conta de utilizador está desativada. Contacte o Administrador.' };
    }

    if (user.password && user.password !== cleanPass) {
      return { success: false, message: 'Palavra-passe incorreta. Por favor tente novamente.' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedUser = { ...user, lastLogin: nowStr };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setIsAuthenticated(true);

    try {
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }

    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action: 'LOGIN_SUCESSO',
      operation: 'Autenticação',
      userId: user.id,
      userName: user.name,
      deviceUsed: 'Teclado / Simulador',
      details: `Início de sessão autorizado para ${user.name} (@${user.username} - ${user.role}).`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);

    return { success: true };
  };

  const logout = () => {
    const prevUser = currentUser;
    setIsAuthenticated(false);
    try {
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(false));
    } catch {
      // ignore
    }

    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action: 'LOGOUT',
      operation: 'Autenticação',
      userId: prevUser.id,
      userName: prevUser.name,
      deviceUsed: 'Teclado / Simulador',
      details: `Sessão encerrada com sucesso pelo utilizador ${prevUser.name}.`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  const registerUser = (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role?: UserRole;
    avatar?: string;
    assignedWarehouseId?: string;
    authProvider?: 'local' | 'google';
  }): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!userData.name.trim()) {
      return { success: false, message: 'Por favor, introduza o seu nome completo.' };
    }
    if (!cleanUsername) {
      return { success: false, message: 'O nome de utilizador é obrigatório.' };
    }
    if (cleanUsername.length < 3) {
      return { success: false, message: 'O nome de utilizador deve ter no mínimo 3 caracteres.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Por favor, introduza um endereço de e-mail válido.' };
    }
    if (userData.authProvider !== 'google' && (!userData.password || userData.password.length < 6)) {
      return { success: false, message: 'A palavra-passe deve ter no mínimo 6 caracteres.' };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `O nome de utilizador "${cleanUsername}" já está em uso. Escolha outro.` };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `Já existe uma conta associada ao e-mail "${cleanEmail}".` };
    }

    const assignedRole: UserRole = userData.role || 'ADMIN';
    const basePermissions = getDefaultPermissionsForRole(assignedRole);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: userData.password || (userData.authProvider === 'google' ? 'GOOGLE_OAUTH_TOKEN' : '123456'),
      role: assignedRole,
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      permissions: basePermissions,
      isActive: true,
      assignedWarehouseId: userData.assignedWarehouseId || selectedWarehouseId,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: nowStr,
      authProvider: userData.authProvider || 'local',
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    try {
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(newUser));
    } catch {
      // ignore
    }

    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action: 'REGISTO_NOVA_CONTA',
      operation: 'Autenticação',
      userId: newUser.id,
      userName: newUser.name,
      deviceUsed: 'Teclado / Simulador',
      details: `Novo registo de conta efetiva: ${newUser.name} (@${newUser.username}, Cargo: ${newUser.role}, Método: ${newUser.authProvider === 'google' ? 'Google Account' : 'Credenciais'}).`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);

    return { success: true, user: newUser };
  };

  const loginWithGoogle = (googleData: {
    email: string;
    name: string;
    avatar?: string;
    role?: UserRole;
  }): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanEmail = googleData.email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Endereço de e-mail do Google inválido.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (existing) {
      if (existing.isActive === false) {
        return {
          success: false,
          message: 'Esta conta Google está associada a um utilizador desativado. Contacte o Administrador.',
        };
      }
      const updatedUser: UserProfile = {
        ...existing,
        lastLogin: nowStr,
        authProvider: 'google',
        avatar: googleData.avatar || existing.avatar,
        name: existing.name || googleData.name,
      };

      setUsers((prev) => prev.map((u) => (u.id === existing.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      setIsAuthenticated(true);

      try {
        localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(true));
        localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }

      const newEvent: AuditEvent = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        action: 'LOGIN_GOOGLE',
        operation: 'Autenticação',
        userId: updatedUser.id,
        userName: updatedUser.name,
        deviceUsed: 'Google OAuth / SSO',
        details: `Sessão iniciada via sincronização direta com Conta Google (${cleanEmail}).`,
      };
      setAuditEvents((prev) => [newEvent, ...prev]);

      return { success: true, user: updatedUser };
    }

    // Auto-create effective account synced with Google
    const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || 'google_user';
    let uniqueUsername = generatedUsername;
    let counter = 1;
    while (users.some((u) => u.username.toLowerCase() === uniqueUsername)) {
      uniqueUsername = `${generatedUsername}${counter}`;
      counter++;
    }

    const assignedRole: UserRole = googleData.role || 'ADMIN';
    const basePermissions = getDefaultPermissionsForRole(assignedRole);

    const newUser: UserProfile = {
      id: `usr-g-${Date.now()}`,
      name: googleData.name.trim() || cleanEmail.split('@')[0],
      username: uniqueUsername,
      email: cleanEmail,
      role: assignedRole,
      avatar:
        googleData.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      permissions: basePermissions,
      isActive: true,
      assignedWarehouseId: selectedWarehouseId,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: nowStr,
      authProvider: 'google',
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    try {
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(newUser));
    } catch {
      // ignore
    }

    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action: 'REGISTO_GOOGLE',
      operation: 'Autenticação',
      userId: newUser.id,
      userName: newUser.name,
      deviceUsed: 'Google OAuth / SSO',
      details: `Nova conta criada e sincronizada instantaneamente via Google Account (${cleanEmail}) com perfil de ${newUser.role}.`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);

    return { success: true, user: newUser };
  };

  const addUser = (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    avatar?: string;
    assignedWarehouseId?: string;
    permissions?: Partial<UserPermissions>;
  }): { success: boolean; message?: string; user?: UserProfile } => {
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, message: 'O nome de utilizador é obrigatório.' };
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `O nome de utilizador "${cleanUsername}" já existe. Escolha outro.` };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `O e-mail "${userData.email}" já está associado a outra conta.` };
    }

    const basePermissions = getDefaultPermissionsForRole(userData.role);
    const newPermissions: UserPermissions = {
      ...basePermissions,
      ...(userData.permissions || {}),
    };

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      username: cleanUsername,
      email: userData.email.trim(),
      password: userData.password || '123456',
      role: userData.role,
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      permissions: newPermissions,
      isActive: true,
      assignedWarehouseId: userData.assignedWarehouseId || selectedWarehouseId,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: undefined,
    };

    setUsers((prev) => [...prev, newUser]);

    logAuditEvent({
      action: 'CRIACAO_UTILIZADOR',
      operation: 'Segurança',
      deviceUsed: 'Teclado / Simulador',
      details: `Novo utilizador cadastrado: ${newUser.name} (@${newUser.username}, Cargo: ${newUser.role}) pelo Administrador ${currentUser.name}.`,
    });

    return { success: true, user: newUser };
  };

  const updateUser = (userId: string, data: Partial<UserProfile>): { success: boolean; message?: string } => {
    const existing = users.find((u) => u.id === userId);
    if (!existing) return { success: false, message: 'Utilizador não encontrado.' };

    if (data.username) {
      const cleanUsername = data.username.trim().toLowerCase();
      if (users.some((u) => u.id !== userId && u.username.toLowerCase() === cleanUsername)) {
        return { success: false, message: `O nome de utilizador "${cleanUsername}" já pertence a outra conta.` };
      }
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...data };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    logAuditEvent({
      action: 'ATUALIZACAO_UTILIZADOR',
      operation: 'Segurança',
      deviceUsed: 'Teclado / Simulador',
      details: `Dados do utilizador ${existing.name} atualizados pelo Administrador ${currentUser.name}.`,
    });

    return { success: true };
  };

  const changeUserPassword = (userId: string, newPassword: string): { success: boolean; message?: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Utilizador não encontrado.' };
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'A palavra-passe deve conter no mínimo 4 caracteres.' };
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, password: newPassword };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    logAuditEvent({
      action: 'ALTERACAO_SENHA',
      operation: 'Segurança',
      deviceUsed: 'Teclado / Simulador',
      details: `Palavra-passe do utilizador ${target.name} alterada com sucesso.`,
    });

    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    if (userId === currentUser.id) {
      return { success: false, message: 'Não é possível eliminar a conta com sessão ativa no momento.' };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Utilizador não encontrado.' };

    const remainingAdmins = users.filter((u) => u.id !== userId && u.role === 'ADMIN');
    if (target.role === 'ADMIN' && remainingAdmins.length === 0) {
      return { success: false, message: 'Não é permitido eliminar o único Administrador Geral do sistema.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    logAuditEvent({
      action: 'EXCLUSAO_UTILIZADOR',
      operation: 'Segurança',
      deviceUsed: 'Teclado / Simulador',
      details: `Utilizador ${target.name} (@${target.username}) excluído do sistema pelo Administrador.`,
    });

    return { success: true };
  };

  const openScannerModal = (mode: ScannerModalMode = 'LOOKUP', targetId?: string) => {
    setScannerModal({
      isOpen: true,
      mode,
      targetId,
    });
  };

  const closeScannerModal = () => {
    setScannerModal((prev) => ({ ...prev, isOpen: false }));
  };

  const updateUserPermissions = (userId: string, permissions: Partial<UserProfile['permissions']>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, permissions: { ...u.permissions, ...permissions } };
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    logAuditEvent({
      action: 'ALTERACAO_PERMISSOES',
      operation: 'Sistema',
      deviceUsed: 'Teclado / Simulador',
      details: `Permissões do utilizador ${userId} atualizadas pelo Administrador.`,
    });
  };

  // Helper Lookups
  const findProductByCode = (code: string): Product | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return products.find(
      (p) =>
        p.barcode.toUpperCase() === clean ||
        p.qrCode.toUpperCase() === clean ||
        p.sku.toUpperCase() === clean ||
        p.internalCode.toUpperCase() === clean
    );
  };

  const findLocationByCode = (code: string): WarehouseLocation | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return locations.find(
      (l) =>
        l.qrCode.toUpperCase() === clean ||
        l.code.toUpperCase() === clean ||
        `LOC-${l.code}`.toUpperCase() === clean
    );
  };

  const findAssetByCode = (code: string): Asset | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return assets.find(
      (a) =>
        a.assetCode.toUpperCase() === clean ||
        a.qrCode.toUpperCase() === clean ||
        a.serialNumber.toUpperCase() === clean
    );
  };

  const getProductStock = (productId: string, warehouseId?: string): number => {
    return stockLocations
      .filter((sl) => sl.productId === productId && (!warehouseId || sl.warehouseId === warehouseId))
      .reduce((sum, sl) => sum + sl.quantity, 0);
  };

  const getProductLocationInfo = (productId: string, warehouseId?: string) => {
    const sl = stockLocations.find(
      (s) => s.productId === productId && (!warehouseId || s.warehouseId === warehouseId) && s.quantity > 0
    );
    if (!sl) {
      // Find default location or warehouse
      const anySl = stockLocations.find((s) => s.productId === productId);
      if (!anySl) return null;
      const wh = warehouses.find((w) => w.id === anySl.warehouseId);
      const loc = locations.find((l) => l.id === anySl.locationId);
      return {
        location: loc,
        warehouse: wh,
        quantity: anySl.quantity,
        batchNumber: anySl.batchNumber,
        serialNumber: anySl.serialNumber,
      };
    }
    const wh = warehouses.find((w) => w.id === sl.warehouseId);
    const loc = locations.find((l) => l.id === sl.locationId);
    return {
      location: loc,
      warehouse: wh,
      quantity: sl.quantity,
      batchNumber: sl.batchNumber,
      serialNumber: sl.serialNumber,
    };
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Create initial stock location entry in current warehouse
    const newStockLoc: ProductStockLocation = {
      id: `stk-${Date.now()}`,
      productId: newProduct.id,
      warehouseId: selectedWarehouseId,
      locationId: locations[0]?.id || 'loc-1',
      quantity: 0,
      lastVerifiedAt: new Date().toISOString(),
    };
    setStockLocations((prev) => [...prev, newStockLoc]);

    logAuditEvent({
      action: 'CADASTRO_PRODUTO',
      operation: 'Estoque',
      productName: newProduct.name,
      productCode: newProduct.sku,
      deviceUsed: 'Teclado / Simulador',
      details: `Novo produto cadastrado com SKU ${newProduct.sku} e código de barras ${newProduct.barcode}.`,
    });

    return newProduct;
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    logAuditEvent({
      action: 'ALTERACAO_PRODUTO',
      operation: 'Estoque',
      productName: product.name,
      productCode: product.sku,
      deviceUsed: 'Teclado / Simulador',
      details: `Produto ${product.name} atualizado.`,
    });
  };

  const deleteProduct = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
    logAuditEvent({
      action: 'EXCLUSAO_PRODUTO',
      operation: 'Estoque',
      productName: p?.name,
      productCode: p?.sku,
      deviceUsed: 'Teclado / Simulador',
      details: `Produto ${p?.name || id} excluído pelo utilizador.`,
    });
  };

  // Stock operations
  const performStockIn = ({
    productId,
    warehouseId,
    locationId,
    quantity,
    batchNumber,
    serialNumber,
    deviceUsed,
    notes,
  }: {
    productId: string;
    warehouseId: string;
    locationId: string;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
    deviceUsed: ScanDeviceType;
    notes?: string;
  }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setStockLocations((prev) => {
      const existing = prev.find(
        (sl) => sl.productId === productId && sl.warehouseId === warehouseId && sl.locationId === locationId
      );
      if (existing) {
        return prev.map((sl) =>
          sl.id === existing.id
            ? {
                ...sl,
                quantity: sl.quantity + quantity,
                batchNumber: batchNumber || sl.batchNumber,
                serialNumber: serialNumber || sl.serialNumber,
                lastVerifiedAt: new Date().toISOString(),
              }
            : sl
        );
      } else {
        return [
          ...prev,
          {
            id: `stk-${Date.now()}`,
            productId,
            warehouseId,
            locationId,
            quantity,
            batchNumber,
            serialNumber,
            lastVerifiedAt: new Date().toISOString(),
          },
        ];
      }
    });

    const warehouse = warehouses.find((w) => w.id === warehouseId);
    const loc = locations.find((l) => l.id === locationId);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'IN',
      productId,
      productName: product.name,
      productSku: product.sku,
      quantity,
      toWarehouseId: warehouseId,
      toLocationId: locationId,
      userId: currentUser.id,
      userName: currentUser.name,
      notes: notes || `Entrada registrada via ${deviceUsed}`,
      deviceUsed,
    };
    setStockMovements((prev) => [movement, ...prev]);

    logAuditEvent({
      action: 'ENTRADA_ESTOQUE',
      operation: 'Estoque',
      productName: product.name,
      productCode: product.sku,
      warehouseName: warehouse?.name,
      locationCode: loc?.code,
      quantity,
      deviceUsed,
      details: `Entrada de ${quantity} ${product.unit} no ${warehouse?.name || ''} - Estante ${loc?.rack || ''}/${loc?.shelf || ''}.`,
    });
  };

  const performStockOut = ({
    productId,
    warehouseId,
    locationId,
    quantity,
    reason,
    deviceUsed,
  }: {
    productId: string;
    warehouseId: string;
    locationId?: string;
    quantity: number;
    reason: string;
    deviceUsed: ScanDeviceType;
  }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setStockLocations((prev) => {
      let remainingToDeduct = quantity;
      return prev.map((sl) => {
        if (sl.productId === productId && sl.warehouseId === warehouseId && (!locationId || sl.locationId === locationId)) {
          if (remainingToDeduct <= 0) return sl;
          const deduct = Math.min(sl.quantity, remainingToDeduct);
          remainingToDeduct -= deduct;
          return {
            ...sl,
            quantity: Math.max(0, sl.quantity - deduct),
            lastVerifiedAt: new Date().toISOString(),
          };
        }
        return sl;
      });
    });

    const warehouse = warehouses.find((w) => w.id === warehouseId);
    const loc = locationId ? locations.find((l) => l.id === locationId) : undefined;

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'OUT',
      productId,
      productName: product.name,
      productSku: product.sku,
      quantity: -quantity,
      fromWarehouseId: warehouseId,
      fromLocationId: locationId,
      userId: currentUser.id,
      userName: currentUser.name,
      notes: reason,
      deviceUsed,
    };
    setStockMovements((prev) => [movement, ...prev]);

    logAuditEvent({
      action: 'SAIDA_ESTOQUE',
      operation: 'Estoque',
      productName: product.name,
      productCode: product.sku,
      warehouseName: warehouse?.name,
      locationCode: loc?.code,
      quantity,
      deviceUsed,
      details: `Saída de ${quantity} ${product.unit} do estoque. Motivo: ${reason}`,
    });
  };

  const performStockTransfer = ({
    productId,
    fromWarehouseId,
    toWarehouseId,
    quantity,
    fromLocationId,
    toLocationId,
    deviceUsed,
  }: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    fromLocationId?: string;
    toLocationId?: string;
    deviceUsed: ScanDeviceType;
  }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Deduct from origin
    performStockOut({
      productId,
      warehouseId: fromWarehouseId,
      locationId: fromLocationId,
      quantity,
      reason: `Transferência para armazém de destino`,
      deviceUsed,
    });

    // Add to destination
    const destLocation =
      toLocationId || locations.find((l) => l.warehouseId === toWarehouseId)?.id || locations[0]?.id || 'loc-1';

    performStockIn({
      productId,
      warehouseId: toWarehouseId,
      locationId: destLocation,
      quantity,
      deviceUsed,
      notes: `Transferência recebida do armazém de origem`,
    });

    logAuditEvent({
      action: 'TRANSFERENCIA_ESTOQUE',
      operation: 'Estoque',
      productName: product.name,
      productCode: product.sku,
      quantity,
      deviceUsed,
      details: `Transferência de ${quantity} unidades entre armazéns concluída.`,
    });
  };

  const assignProductLocation = ({
    productId,
    warehouseId,
    locationId,
    deviceUsed,
  }: {
    productId: string;
    warehouseId: string;
    locationId: string;
    deviceUsed: ScanDeviceType;
  }) => {
    const product = products.find((p) => p.id === productId);
    const loc = locations.find((l) => l.id === locationId);
    const wh = warehouses.find((w) => w.id === warehouseId);
    if (!product || !loc) return;

    setStockLocations((prev) => {
      const match = prev.find((sl) => sl.productId === productId && sl.warehouseId === warehouseId);
      if (match) {
        return prev.map((sl) =>
          sl.id === match.id
            ? { ...sl, locationId, lastVerifiedAt: new Date().toISOString() }
            : sl
        );
      } else {
        return [
          ...prev,
          {
            id: `stk-${Date.now()}`,
            productId,
            warehouseId,
            locationId,
            quantity: 0,
            lastVerifiedAt: new Date().toISOString(),
          },
        ];
      }
    });

    logAuditEvent({
      action: 'AJUSTE_LOCALIZACAO',
      operation: 'Estoque',
      productName: product.name,
      productCode: product.sku,
      warehouseName: wh?.name,
      locationCode: loc.code,
      deviceUsed,
      details: `Produto ${product.name} alocado na posição ${loc.rack}/${loc.shelf}/${loc.bin} via ${deviceUsed}.`,
    });
  };

  // Invoicing & Integrated Flow (Sections 2, 3, 4)
  const issueInvoice = ({
    type,
    customerId,
    warehouseId,
    paymentMethod,
    items,
    notes,
    dueDate,
  }: {
    type: InvoiceType;
    customerId: string;
    warehouseId: string;
    paymentMethod: PaymentMethod;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discountRate?: number;
      taxRate?: number;
    }[];
    notes?: string;
    dueDate?: string;
  }): Invoice => {
    const customer = customers.find((c) => c.id === customerId) || customers[2];
    const warehouse = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

    const seriesPrefix =
      type === 'FATURA'
        ? 'FT 2026'
        : type === 'FATURA_SIMPLIFICADA'
        ? 'FS 2026'
        : type === 'ORCAMENTO'
        ? 'ORC 2026'
        : type === 'NOTA_CREDITO'
        ? 'NC 2026'
        : type === 'VENDA_DINHEIRO'
        ? 'VD 2026'
        : 'REC 2026';

    const countOfSeries = invoices.filter((i) => i.series === seriesPrefix).length + 1;
    const invoiceNumber = `${seriesPrefix}/${String(countOfSeries).padStart(4, '0')}`;

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const invoiceItems = items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const itemSub = item.quantity * item.unitPrice;
      const discount = item.discountRate ? (itemSub * item.discountRate) / 100 : 0;
      const itemAfterDiscount = itemSub - discount;
      const taxR = item.taxRate !== undefined ? item.taxRate : prod.taxRate || 14;
      const taxVal = (itemAfterDiscount * taxR) / 100;
      const itemTotal = itemAfterDiscount + taxVal;

      subtotal += itemSub;
      discountTotal += discount;
      taxTotal += taxVal;

      return {
        id: `inv-item-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate || 0,
        taxRate: taxR,
        taxAmount: taxVal,
        subtotal: itemSub,
        total: itemTotal,
      };
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    const isPaidImmediately = paymentMethod === 'DINHEIRO' || paymentMethod === 'TPA_MULTICAIXA';

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      type,
      number: invoiceNumber,
      series: seriesPrefix,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      customerId: customer.id,
      customerName: customer.name,
      customerNif: customer.nif,
      customerAddress: customer.address,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      items: invoiceItems,
      subtotal,
      discountTotal,
      taxTotal,
      total: grandTotal,
      paymentMethod,
      notes: notes || `Documento emitido pelo sistema Inventa KAF`,
      issuedByUserId: currentUser.id,
      issuedByUserName: currentUser.name,
      status: isPaidImmediately ? 'PAID' : 'ISSUED',
      stockDeducted: true, // Auto-deducted!
      financialRecorded: true, // Auto-financial!
      createdAt: new Date().toISOString(),
    };

    // 1. AUTOMATIC STOCK DEDUCTION (Section 3)
    invoiceItems.forEach((it) => {
      setStockLocations((prev) => {
        let toDeduct = it.quantity;
        return prev.map((sl) => {
          if (sl.productId === it.productId && sl.warehouseId === warehouse.id) {
            if (toDeduct <= 0) return sl;
            const deduction = Math.min(sl.quantity, toDeduct);
            toDeduct -= deduction;
            return {
              ...sl,
              quantity: Math.max(0, sl.quantity - deduction),
              lastVerifiedAt: new Date().toISOString(),
            };
          }
          return sl;
        });
      });

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${it.productId}`,
        timestamp: new Date().toISOString(),
        type: 'SALE_DEDUCTION',
        productId: it.productId,
        productName: it.productName,
        productSku: it.sku,
        quantity: -it.quantity,
        fromWarehouseId: warehouse.id,
        documentRef: invoiceNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        notes: `Baixa automática gerada pela emissão da Fatura ${invoiceNumber}`,
        deviceUsed: 'Teclado / Simulador',
      };
      setStockMovements((prev) => [movement, ...prev]);
    });

    // 2. AUTOMATIC FINANCIAL ENTRY (Section 4)
    if (isPaidImmediately) {
      // Direct cash or card receipt
      const targetAccId = paymentMethod === 'DINHEIRO' ? 'acc-1' : 'acc-2';
      setFinancialAccounts((prev) =>
        prev.map((acc) => (acc.id === targetAccId ? { ...acc, balance: acc.balance + grandTotal } : acc))
      );
    } else {
      // Account Receivable
      const ar: AccountReceivable = {
        id: `ar-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        description: `Fatura ${invoiceNumber} - ${invoiceItems.map((i) => i.productName).join(', ')}`,
        amount: grandTotal,
        dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        invoiceId: newInvoice.id,
        invoiceNumber,
      };
      setAccountsReceivable((prev) => [ar, ...prev]);
    }

    // 3. AUTOMATIC ACCOUNTING ENTRY (Section 4)
    const accEntry: AccountingEntry = {
      id: `acc-ent-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      description: `Reconhecimento de Faturação ${invoiceNumber} (${customer.name})`,
      debitAccount: isPaidImmediately
        ? paymentMethod === 'DINHEIRO'
          ? '41.1 Caixa Geral'
          : '43.1 Bancos - Depósitos'
        : '21.1 Clientes Correntes',
      creditAccount: '71.1 Vendas de Mercadorias / 24.3 Estado - IVA Liquidado',
      amount: grandTotal,
      documentRef: invoiceNumber,
      autoGenerated: true,
    };
    setAccountingEntries((prev) => [accEntry, ...prev]);

    // 4. AUDIT EVENT (Section 15, 24)
    logAuditEvent({
      action: isPaidImmediately ? 'EMISSAO_FATURA_E_RECEBIMENTO' : 'EMISSAO_FATURA_A_RECEBER',
      operation: 'Faturação',
      warehouseName: warehouse.name,
      documentRef: invoiceNumber,
      quantity: invoiceItems.reduce((s, i) => s + i.quantity, 0),
      deviceUsed: 'Teclado / Simulador',
      details: `Fatura ${invoiceNumber} emitida para ${customer.name}. Total: ${grandTotal} Kz. Baixa automática realizada no ${warehouse.name}.`,
    });

    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const cancelInvoice = (invoiceId: string, reason: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === 'CANCELLED') return;

    // Restore stock
    inv.items.forEach((it) => {
      setStockLocations((prev) =>
        prev.map((sl) => {
          if (sl.productId === it.productId && sl.warehouseId === inv.warehouseId) {
            return {
              ...sl,
              quantity: sl.quantity + it.quantity,
              lastVerifiedAt: new Date().toISOString(),
            };
          }
          return sl;
        })
      );

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${it.productId}`,
        timestamp: new Date().toISOString(),
        type: 'ADJUSTMENT',
        productId: it.productId,
        productName: it.productName,
        productSku: it.sku,
        quantity: it.quantity,
        toWarehouseId: inv.warehouseId,
        documentRef: `ESTORNO-${inv.number}`,
        userId: currentUser.id,
        userName: currentUser.name,
        notes: `Estorno de estoque por cancelamento da fatura ${inv.number}: ${reason}`,
        deviceUsed: 'Teclado / Simulador',
      };
      setStockMovements((prev) => [movement, ...prev]);
    });

    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: 'CANCELLED' } : i)));

    logAuditEvent({
      action: 'CANCELAMENTO_FATURA',
      operation: 'Faturação',
      documentRef: inv.number,
      deviceUsed: 'Teclado / Simulador',
      details: `Fatura ${inv.number} cancelada. Motivo: ${reason}. Estoque restaurado.`,
    });
  };

  // Physical Inventory Sessions (Section 14, 25)
  const createInventorySession = (title: string, warehouseId: string, notes?: string): InventorySession => {
    const wh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
    const sessionCount = inventorySessions.length + 1;
    const code = `INV-2026-${String(sessionCount).padStart(4, '0')}`;

    // Pre-populate with current system quantities for products in this warehouse
    const items = products.map((p) => {
      const locInfo = getProductLocationInfo(p.id, warehouseId);
      const sysQty = getProductStock(p.id, warehouseId);
      return {
        id: `ci-${Date.now()}-${p.id}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        locationCode: locInfo?.location?.code || 'GERAL',
        systemQty: sysQty,
        countedQty: 0,
        difference: -sysQty,
        status: 'PENDING' as const,
      };
    });

    const newSession: InventorySession = {
      id: `inv-sess-${Date.now()}`,
      code,
      title,
      warehouseId,
      warehouseName: wh.name,
      status: 'COUNTING',
      startedAt: new Date().toISOString(),
      supervisorId: currentUser.id,
      supervisorName: currentUser.name,
      items,
      notes,
    };

    setInventorySessions((prev) => [newSession, ...prev]);

    logAuditEvent({
      action: 'CRIACAO_SESSAO_INVENTARIO',
      operation: 'Inventário',
      warehouseName: wh.name,
      documentRef: code,
      deviceUsed: 'Teclado / Simulador',
      details: `Sessão de inventário físico ${code} iniciada no ${wh.name}.`,
    });

    return newSession;
  };

  const recordInventoryCountItem = ({
    sessionId,
    barcodeOrSku,
    countedQuantity,
    locationCode,
    deviceUsed,
  }: {
    sessionId: string;
    barcodeOrSku: string;
    countedQuantity: number;
    locationCode?: string;
    deviceUsed: ScanDeviceType;
  }): boolean => {
    const session = inventorySessions.find((s) => s.id === sessionId);
    if (!session || session.status === 'APPROVED') return false;

    const prod = findProductByCode(barcodeOrSku);
    if (!prod) return false;

    setInventorySessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;

        const existingItemIndex = s.items.findIndex((item) => item.productId === prod.id);
        let updatedItems = [...s.items];

        if (existingItemIndex >= 0) {
          const current = s.items[existingItemIndex];
          const newCounted = current.countedQty + countedQuantity;
          const diff = newCounted - current.systemQty;
          const status = diff === 0 ? 'MATCH' : diff > 0 ? 'SURPLUS' : 'DEFICIT';

          updatedItems[existingItemIndex] = {
            ...current,
            countedQty: newCounted,
            difference: diff,
            status,
            locationCode: locationCode || current.locationCode,
            lastScannedAt: new Date().toISOString(),
            scannedBy: currentUser.name,
          };
        } else {
          const sysQty = getProductStock(prod.id, s.warehouseId);
          const diff = countedQuantity - sysQty;
          const status = diff === 0 ? 'MATCH' : diff > 0 ? 'SURPLUS' : 'DEFICIT';
          updatedItems.push({
            id: `ci-${Date.now()}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            barcode: prod.barcode,
            locationCode: locationCode || 'E01-P01-01A',
            systemQty: sysQty,
            countedQty: countedQuantity,
            difference: diff,
            status,
            lastScannedAt: new Date().toISOString(),
            scannedBy: currentUser.name,
          });
        }

        return { ...s, items: updatedItems };
      })
    );

    logAuditEvent({
      action: 'LEITURA DE PRODUTO',
      operation: 'Inventário',
      productName: prod.name,
      productCode: prod.sku,
      warehouseName: session.warehouseName,
      locationCode,
      quantity: countedQuantity,
      deviceUsed,
      documentRef: session.code,
      details: `Contagem física registrada: ${countedQuantity}x ${prod.name} via ${deviceUsed}.`,
    });

    return true;
  };

  const submitInventoryForApproval = (sessionId: string) => {
    setInventorySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'PENDING_APPROVAL' } : s))
    );
    logAuditEvent({
      action: 'ENVIO_INVENTARIO_APROVACAO',
      operation: 'Inventário',
      deviceUsed: 'Teclado / Simulador',
      details: `Sessão de inventário enviada para aprovação do Administrador.`,
    });
  };

  const approveInventoryAdjustment = (sessionId: string) => {
    const session = inventorySessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Apply adjustments to stock
    session.items.forEach((item) => {
      if (item.difference !== 0) {
        setStockLocations((prev) => {
          const loc = prev.find((sl) => sl.productId === item.productId && sl.warehouseId === session.warehouseId);
          if (loc) {
            return prev.map((sl) =>
              sl.id === loc.id
                ? { ...sl, quantity: item.countedQty, lastVerifiedAt: new Date().toISOString() }
                : sl
            );
          } else {
            return [
              ...prev,
              {
                id: `stk-${Date.now()}-${item.productId}`,
                productId: item.productId,
                warehouseId: session.warehouseId,
                locationId: locations[0]?.id || 'loc-1',
                quantity: item.countedQty,
                lastVerifiedAt: new Date().toISOString(),
              },
            ];
          }
        });

        const movement: StockMovement = {
          id: `mov-${Date.now()}-${item.productId}`,
          timestamp: new Date().toISOString(),
          type: 'ADJUSTMENT',
          productId: item.productId,
          productName: item.productName,
          productSku: item.sku,
          quantity: item.difference,
          toWarehouseId: session.warehouseId,
          documentRef: session.code,
          userId: currentUser.id,
          userName: currentUser.name,
          notes: `Ajuste de inventário aprovado (${item.difference > 0 ? '+' : ''}${item.difference} un).`,
          deviceUsed: 'Teclado / Simulador',
        };
        setStockMovements((prev) => [movement, ...prev]);
      }
    });

    setInventorySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'APPROVED',
              completedAt: new Date().toISOString(),
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
            }
          : s
      )
    );

    logAuditEvent({
      action: 'APROVACAO_AJUSTE_INVENTARIO',
      operation: 'Inventário',
      documentRef: session.code,
      warehouseName: session.warehouseName,
      deviceUsed: 'Teclado / Simulador',
      details: `Administrador aprovou os ajustes da sessão ${session.code}. Estoque atualizado automaticamente.`,
    });
  };

  const rejectInventorySession = (sessionId: string, reason?: string) => {
    setInventorySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'REJECTED', notes: reason || s.notes } : s))
    );
    logAuditEvent({
      action: 'REJEICAO_INVENTARIO',
      operation: 'Inventário',
      deviceUsed: 'Teclado / Simulador',
      details: `Sessão de inventário rejeitada: ${reason || 'Contagem recalculada necessária'}.`,
    });
  };

  // Asset management
  const addAsset = (assetData: Omit<Asset, 'id' | 'history'>): Asset => {
    const newAsset: Asset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          action: 'Ativo cadastrado no sistema',
          responsible: currentUser.name,
          notes: 'Entrada patrimonial registrada com código QR e número de série.',
        },
      ],
    };
    setAssets((prev) => [newAsset, ...prev]);

    logAuditEvent({
      action: 'CADASTRO_ATIVO',
      operation: 'Ativos',
      productName: newAsset.name,
      productCode: newAsset.assetCode,
      deviceUsed: 'Teclado / Simulador',
      details: `Equipamento ${newAsset.name} registrado com código de patrimônio ${newAsset.assetCode}.`,
    });

    return newAsset;
  };

  const updateAssetStatus = (assetId: string, status: Asset['status'], notes: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            status,
            history: [
              ...a.history,
              {
                id: `h-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                action: `Alteração de estado para: ${status}`,
                responsible: currentUser.name,
                notes,
              },
            ],
          };
        }
        return a;
      })
    );
    logAuditEvent({
      action: 'ALTERACAO_ESTADO_ATIVO',
      operation: 'Ativos',
      deviceUsed: 'Teclado / Simulador',
      details: `Estado do ativo alterado para ${status}. Notas: ${notes}`,
    });
  };

  // Finance Actions
  const payAccountPayable = (id: string, financialAccountId: string) => {
    const ap = accountsPayable.find((p) => p.id === id);
    if (!ap) return;

    setFinancialAccounts((prev) =>
      prev.map((acc) => (acc.id === financialAccountId ? { ...acc, balance: acc.balance - ap.amount } : acc))
    );

    setAccountsPayable((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'PAID', paidAt: new Date().toISOString() } : p))
    );

    logAuditEvent({
      action: 'PAGAMENTO_CONTA',
      operation: 'Financeiro',
      documentRef: ap.invoiceRef,
      deviceUsed: 'Teclado / Simulador',
      details: `Pagamento de conta a pagar ${ap.description} no valor de ${ap.amount} Kz.`,
    });
  };

  const receiveAccountReceivable = (id: string, financialAccountId: string) => {
    const ar = accountsReceivable.find((r) => r.id === id);
    if (!ar) return;

    setFinancialAccounts((prev) =>
      prev.map((acc) => (acc.id === financialAccountId ? { ...acc, balance: acc.balance + ar.amount } : acc))
    );

    setAccountsReceivable((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'RECEIVED', receivedAt: new Date().toISOString() } : r))
    );

    logAuditEvent({
      action: 'RECEBIMENTO_CONTA',
      operation: 'Financeiro',
      documentRef: ar.invoiceNumber,
      deviceUsed: 'Teclado / Simulador',
      details: `Recebimento de fatura ${ar.invoiceNumber || ''} no valor de ${ar.amount} Kz.`,
    });
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setLocations(INITIAL_LOCATIONS);
    setProducts(INITIAL_PRODUCTS);
    setStockLocations(INITIAL_STOCK_LOCATIONS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setInvoices(INITIAL_INVOICES);
    setInventorySessions(INITIAL_INVENTORY_SESSIONS);
    setAssets(INITIAL_ASSETS);
    setAccountsPayable(INITIAL_ACCOUNTS_PAYABLE);
    setAccountsReceivable(INITIAL_ACCOUNTS_RECEIVABLE);
    setFinancialAccounts(INITIAL_FINANCIAL_ACCOUNTS);
    setAccountingEntries(INITIAL_ACCOUNTING_ENTRIES);
    setAuditEvents(INITIAL_AUDIT_EVENTS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        isAuthenticated,
        login,
        logout,
        registerUser,
        loginWithGoogle,
        addUser,
        updateUser,
        deleteUser,
        changeUserPassword,
        updateUserPermissions,
        selectedWarehouseId,
        setSelectedWarehouseId,
        warehouses,
        locations,
        products,
        stockLocations,
        stockMovements,
        invoices,
        customers,
        suppliers,
        inventorySessions,
        assets,
        accountsPayable,
        accountsReceivable,
        financialAccounts,
        accountingEntries,
        auditEvents,
        scannerModal,
        openScannerModal,
        closeScannerModal,
        addProduct,
        updateProduct,
        deleteProduct,
        performStockIn,
        performStockOut,
        performStockTransfer,
        assignProductLocation,
        issueInvoice,
        cancelInvoice,
        createInventorySession,
        recordInventoryCountItem,
        submitInventoryForApproval,
        approveInventoryAdjustment,
        rejectInventorySession,
        addAsset,
        updateAssetStatus,
        payAccountPayable,
        receiveAccountReceivable,
        logAuditEvent,
        getProductStock,
        getProductLocationInfo,
        findProductByCode,
        findLocationByCode,
        findAssetByCode,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
