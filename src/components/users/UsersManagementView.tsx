import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  Building2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  UserCheck,
  UserX,
  SlidersHorizontal,
} from 'lucide-react';
import { UsersPermissionsModal } from './UsersPermissionsModal';

export const UsersManagementView: React.FC = () => {
  const {
    users,
    currentUser,
    warehouses,
    addUser,
    updateUser,
    deleteUser,
    changeUserPassword,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserProfile | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('OPERATOR_STOCK');
  const [newUserWarehouse, setNewUserWarehouse] = useState<string>(warehouses[0]?.id || 'wh-1');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Password Change State
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Edit User State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('OPERATOR_STOCK');
  const [editWarehouse, setEditWarehouse] = useState<string>('wh-1');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Check admin authorization
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.permissions.manageUsers;

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-8 rounded-2xl bg-slate-900 border border-red-500/30 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito ao Administrador</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Apenas utilizadores com perfil de Administrador ou permissão de Gestão de Utilizadores
            podem criar e gerir credenciais no Inventa KAF.
          </p>
          <div className="mt-4 text-xs text-slate-500">
            Sessão atual: <span className="text-slate-300 font-medium">{currentUser.name}</span> ({currentUser.role})
          </div>
        </div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Action Handlers
  const handleOpenAddUser = () => {
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserConfirmPassword('');
    setNewUserRole('OPERATOR_STOCK');
    setNewUserWarehouse(warehouses[0]?.id || 'wh-1');
    setFormError(null);
    setFormSuccess(null);
    setIsAddUserModalOpen(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim()) {
      setFormError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    if (newUserPassword.length < 4) {
      setFormError('A palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newUserPassword !== newUserConfirmPassword) {
      setFormError('As palavras-passe introduzidas não coincidem.');
      return;
    }

    const res = addUser({
      name: newUserName,
      username: newUserUsername,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      assignedWarehouseId: newUserWarehouse,
    });

    if (!res.success) {
      setFormError(res.message || 'Erro ao criar utilizador.');
      return;
    }

    setFormSuccess(`Utilizador "${newUserName}" criado com sucesso!`);
    setTimeout(() => {
      setIsAddUserModalOpen(false);
      setFormSuccess(null);
    }, 1200);
  };

  const handleOpenPasswordModal = (user: UserProfile) => {
    setSelectedUserForAction(user);
    setNewPasswordValue('');
    setConfirmPasswordValue('');
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;

    if (newPasswordValue.length < 4) {
      setPasswordError('A nova palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      setPasswordError('As palavras-passe não coincidem.');
      return;
    }

    const res = changeUserPassword(selectedUserForAction.id, newPasswordValue);
    if (!res.success) {
      setPasswordError(res.message || 'Erro ao alterar palavra-passe.');
      return;
    }

    setIsPasswordModalOpen(false);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setSelectedUserForAction(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditWarehouse(user.assignedWarehouseId || warehouses[0]?.id || 'wh-1');
    setEditIsActive(user.isActive !== false);
    setEditError(null);
    setIsEditUserModalOpen(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction) return;

    const res = updateUser(selectedUserForAction.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim(),
      role: editRole,
      assignedWarehouseId: editWarehouse,
      isActive: editIsActive,
    });

    if (!res.success) {
      setEditError(res.message || 'Erro ao atualizar dados.');
      return;
    }

    setIsEditUserModalOpen(false);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('Não é possível eliminar a sua própria conta enquanto estiver com a sessão aberta.');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja eliminar o utilizador "${user.name}" (@${user.username})? Esta ação não pode ser desfeita.`
    );

    if (confirmDelete) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.message || 'Erro ao eliminar utilizador.');
      }
    }
  };

  const handleOpenPermissions = (user: UserProfile) => {
    setSelectedUserForAction(user);
    setIsPermissionsModalOpen(true);
  };

  // Metrics
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter((u) => u.role === 'ADMIN').length;
  const activeOperatorsCount = users.filter((u) => u.role !== 'ADMIN' && u.isActive !== false).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Gestão de Utilizadores & Segurança
              </h1>
              <p className="text-xs text-slate-400">
                Criar contas para colaboradores, definir palavras-passe e gerir permissões de acesso
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="open-create-user-button"
            type="button"
            onClick={handleOpenAddUser}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Novo Utilizador</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Utilizadores
            </span>
            <div className="text-2xl font-black text-white mt-1">{totalUsersCount}</div>
            <span className="text-[11px] text-slate-400">Contas registadas no sistema</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Administradores
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">{adminUsersCount}</div>
            <span className="text-[11px] text-slate-400">Acesso global irrestrito</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operadores Ativos
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{activeOperatorsCount}</div>
            <span className="text-[11px] text-slate-400">Estoque, Caixa & Auditoria</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sessão Atual
            </span>
            <div className="text-sm font-bold text-white mt-1 truncate max-w-[150px]">
              {currentUser.name}
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium">
              @{currentUser.username} • {currentUser.role}
            </span>
          </div>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, @utilizador ou e-mail..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Filtrar:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas as Funções</option>
            <option value="ADMIN">Administradores</option>
            <option value="OPERATOR_STOCK">Operadores de Estoque</option>
            <option value="OPERATOR_INVOICE">Operadores de Faturação</option>
            <option value="AUDITOR">Auditores</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Cargo / Função</th>
                <th className="px-6 py-4">Armazém Atribuído</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4 text-right">Ações de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum utilizador encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const assignedWarehouse = warehouses.find((w) => w.id === u.assignedWarehouseId);
                  const isCurrent = u.id === currentUser.id;

                  const roleBadge =
                    u.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Administrador
                      </span>
                    ) : u.role === 'OPERATOR_STOCK' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        Operador de Estoque
                      </span>
                    ) : u.role === 'OPERATOR_INVOICE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Operador de Faturação
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        Auditor
                      </span>
                    );

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold uppercase">
                                  Você
                                </span>
                              )}
                              {u.authProvider === 'google' ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                                  <span>Google Sync</span>
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                                  Credencial
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              <span className="text-slate-300 font-mono">@{u.username}</span>
                              <span className="mx-1.5">•</span>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">{roleBadge}</td>

                      {/* Warehouse */}
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {assignedWarehouse ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{assignedWarehouse.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Todos os Armazéns</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {u.lastLogin ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{u.lastLogin}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Sem login registado</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Change Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(u)}
                            title="Redefinir palavra-passe"
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Granular Permissions */}
                          <button
                            type="button"
                            onClick={() => handleOpenPermissions(u)}
                            title="Configurar permissões granulares"
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Edit User Info */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            title="Editar dados cadastrais"
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              title="Eliminar utilizador"
                              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Modal: Create New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Cadastrar Novo Utilizador</h3>
                  <p className="text-xs text-slate-400">Criar credenciais e definir acesso ao sistema</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: António Manuel Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Nome de Utilizador (@username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="ex: antonio.silva"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Usado para entrar na conta</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="antonio@inventakaf.ao"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Palavra-passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Confirmar Palavra-passe *
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newUserConfirmPassword}
                    onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                    placeholder="Repita a palavra-passe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Função no Sistema *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPERATOR_STOCK">Operador de Estoque</option>
                    <option value="OPERATOR_INVOICE">Operador de Faturação</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="ADMIN">Administrador Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Armazém Principal
                  </label>
                  <select
                    value={newUserWarehouse}
                    onChange={(e) => setNewUserWarehouse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Preview Note */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Nota de Acesso:</span> As permissões padrão para
                a função selecionada serão configuradas automaticamente e podem ser personalizadas
                individualmente a qualquer momento.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Salvar e Ativar Utilizador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {isPasswordModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Redefinir Palavra-passe</h3>
                  <p className="text-xs text-slate-400">Para: {selectedUserForAction.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nova Palavra-passe *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordChange ? 'text' : 'password'}
                    required
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPasswordChange ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Confirmar Nova Palavra-passe *
                </label>
                <input
                  type={showPasswordChange ? 'text' : 'password'}
                  required
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  placeholder="Repita a nova palavra-passe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Atualizar Palavra-passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditUserModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Editar Utilizador</h3>
                  <p className="text-xs text-slate-400">Atualizar dados cadastrais e armazém</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPERATOR_STOCK">Operador de Estoque</option>
                    <option value="OPERATOR_INVOICE">Operador de Faturação</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Armazém Atribuído
                  </label>
                  <select
                    value={editWarehouse}
                    onChange={(e) => setEditWarehouse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Conta Ativa</div>
                    <div className="text-[11px] text-slate-400">
                      Se desativada, o colaborador não conseguirá iniciar sessão
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      <UsersPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />
    </div>
  );
};
