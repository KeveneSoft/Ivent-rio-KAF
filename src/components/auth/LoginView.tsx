import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  UserPlus,
  Mail,
  Warehouse,
  Sparkles,
  ArrowRight,
  Shield,
  Check,
  X,
} from 'lucide-react';

// Official Google Icon Component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginView: React.FC = () => {
  const { login, registerUser, loginWithGoogle, users, warehouses } = useApp();

  // Active Tab: 'LOGIN' or 'REGISTER'
  const [activeAuthTab, setActiveAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');
  const [regWarehouse, setRegWarehouse] = useState<string>(warehouses[0]?.id || 'wh-1');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Google Sync Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleSyncLoading, setGoogleSyncLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [useOtherGoogleAccount, setUseOtherGoogleAccount] = useState(false);

  // Detected default Google account from metadata environment
  const detectedGoogleEmail = 'stsy18kevene@gmail.com';
  const detectedGoogleName = 'Kevene Santos';

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Credenciais inválidas.');
      }
    }, 250);
  };

  // Handle Quick Demo Login
  const handleQuickLogin = (uname: string, pass: string) => {
    setIdentifier(uname);
    setPassword(pass);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(uname, pass);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Falha ao autenticar.');
      }
    }, 200);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Por favor, introduza o seu Nome Completo.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Por favor, defina um Nome de Utilizador.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Por favor, introduza um endereço de e-mail válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As palavras-passes não coincidem. Verifique a confirmação.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerUser({
        name: regName.trim(),
        username: regUsername.trim().toLowerCase(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        assignedWarehouseId: regWarehouse,
        authProvider: 'local',
      });

      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao criar conta.');
      }
    }, 300);
  };

  // Handle Google Login / Sync
  const handleGoogleAuth = (emailToUse: string, nameToUse: string) => {
    setGoogleSyncLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginWithGoogle({
        email: emailToUse,
        name: nameToUse,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: 'ADMIN',
      });

      setGoogleSyncLoading(false);
      setIsGoogleModalOpen(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Falha na autenticação com o Google.');
      }
    }, 600);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Vazia', color: 'bg-slate-700', percent: 0 };
    if (pass.length < 6) return { label: 'Fraca', color: 'bg-red-500', percent: 25 };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { label: 'Forte & Segura', color: 'bg-emerald-500', percent: 100 };
    }
    if (pass.length >= 6 && hasLetters && hasNumbers) {
      return { label: 'Média', color: 'bg-amber-500', percent: 65 };
    }
    return { label: 'Razoável', color: 'bg-blue-500', percent: 40 };
  };

  const passStrength = getPasswordStrength(regPassword);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tight">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">INVENTA KAF</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 uppercase tracking-wide">
                ERP Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Gestão Integrada de Estoque, Faturação & Contabilidade</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sessão Protegida & Criptografada</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          {/* Card Wrapper */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 transition-all">
            {/* Tabs Header: Iniciar Sessão vs Criar Nova Conta */}
            <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => {
                  setActiveAuthTab('LOGIN');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeAuthTab === 'LOGIN'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sessão</span>
              </button>

              <button
                id="auth-tab-register"
                type="button"
                onClick={() => {
                  setActiveAuthTab('REGISTER');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeAuthTab === 'REGISTER'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Nova Conta</span>
              </button>
            </div>

            {/* Sub-header inside Card */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {activeAuthTab === 'LOGIN' ? 'Aceder ao Inventa KAF' : 'Registo de Nova Conta Efetiva'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeAuthTab === 'LOGIN'
                  ? 'Entre com a sua conta Google ou credenciais de operador'
                  : 'Crie a sua conta personalizada com perfil e armazém definidos'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                id="auth-error-alert"
                className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-fadeIn"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  {successMessage}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* GOOGLE SIGN-IN / ONE-CLICK SYNC BUTTON (Official Style)  */}
            {/* ========================================================= */}
            <div className="mb-6">
              <button
                id="google-signin-button"
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] border border-slate-200 cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5" />
                <div className="flex items-center gap-1.5">
                  <span>
                    {activeAuthTab === 'LOGIN' ? 'Entrar com a Conta Google' : 'Registar e Sincronizar com Google'}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 hidden sm:inline">
                    Rápido & Direto
                  </span>
                </div>
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-slate-900 text-slate-500 text-xs uppercase tracking-wider font-medium">
                  ou com dados de utilizador
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* TAB 1: INICIAR SESSÃO (LOGIN) FORM                        */}
            {/* ========================================================= */}
            {activeAuthTab === 'LOGIN' && (
              <div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Nome de Utilizador ou E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="login-username-input"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Ex: admin ou stsy18kevene@gmail.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Palavra-passe
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                        title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="login-submit-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>A autenticar...</span>
                      </div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Entrar no Inventa KAF</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Switch to Register link */}
                <div className="mt-5 text-center text-xs text-slate-400">
                  <span>Não possui uma conta registada? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAuthTab('REGISTER');
                      setErrorMessage(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors cursor-pointer"
                  >
                    Criar conta efetiva agora
                  </button>
                </div>

                {/* Demo Accounts Quick Selection (Collapsible / Scannable) */}
                <div className="mt-8 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Contas Rápidas de Demonstração
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium">1 clique para testar</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {users.slice(0, 3).map((u) => {
                      const roleLabel =
                        u.role === 'ADMIN'
                          ? 'Administrador Geral'
                          : u.role === 'OPERATOR_STOCK'
                          ? 'Operador de Estoque'
                          : u.role === 'OPERATOR_INVOICE'
                          ? 'Operador de Faturação'
                          : 'Auditor';

                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickLogin(u.username, u.password || 'admin123')}
                          className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.authProvider === 'google' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Google
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <span>@{u.username}</span>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">{roleLabel}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-500 group-hover:text-amber-400 transition-colors pr-1">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: CRIAR NOVA CONTA (REGISTER) FORM                   */}
            {/* ========================================================= */}
            {activeAuthTab === 'REGISTER' && (
              <div>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nome Completo <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="register-name-input"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ex: Kevene Santos"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Nome de Utilizador & E-mail in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Utilizador (@username) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="register-username-input"
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="ex: kevene"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        E-mail / Gmail <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="register-email-input"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seu@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cargo & Armazém */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Função / Cargo <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="register-role-select"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      >
                        <option value="ADMIN">Administrador Geral (Acesso Total)</option>
                        <option value="OPERATOR_STOCK">Operador de Estoque (Scanner & Movimentos)</option>
                        <option value="OPERATOR_INVOICE">Operador de Caixa & Faturação</option>
                        <option value="AUDITOR">Auditor de Controlo Interno</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Armazém de Trabalho
                      </label>
                      <select
                        id="register-warehouse-select"
                        value={regWarehouse}
                        onChange={(e) => setRegWarehouse(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Senha e Confirmação de Senha */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Palavra-passe (min. 6) <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="register-password-input"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirmar Palavra-passe <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="register-confirm-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repita a palavra-passe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Indicador visual de força da palavra-passe */}
                  {regPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Segurança da Senha:</span>
                        <span className="font-semibold text-slate-300">{passStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all duration-300`}
                          style={{ width: `${passStrength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    id="register-submit-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>A criar conta efetiva...</span>
                      </div>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Criar Conta e Entrar no Sistema</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Switch to Login link */}
                <div className="mt-5 text-center text-xs text-slate-400">
                  <span>Já possui uma conta registada? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAuthTab('LOGIN');
                      setErrorMessage(null);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors cursor-pointer"
                  >
                    Iniciar sessão agora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Guarantee Note */}
          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Sistema multi-armazém com conformidade de auditoria e controlo de acessos.</span>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* GOOGLE SYNCHRONIZATION DIALOG / MODAL                    */}
      {/* ========================================================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-left">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!googleSyncLoading) setIsGoogleModalOpen(false);
              }}
              disabled={googleSyncLoading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shadow-white/5">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Sincronizar com Conta Google</h3>
                <p className="text-xs text-slate-400">Acesso direto e seguro sem necessidade de memorizar senhas</p>
              </div>
            </div>

            {googleSyncLoading ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border-3 border-amber-500 border-t-transparent animate-spin" />
                <div>
                  <div className="font-bold text-sm text-white">A sincronizar com a Conta Google...</div>
                  <div className="text-xs text-slate-400 mt-1">A verificar permissões e a criar sessão segura...</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primary Detected Google Account Card */}
                {!useOtherGoogleAccount ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Conta Google Detetada no Navegador:
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGoogleAuth(detectedGoogleEmail, detectedGoogleName)}
                      className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700 hover:border-amber-500/60 text-left transition-all flex items-center justify-between group cursor-pointer shadow-inner"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                          K
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                            <span>{detectedGoogleName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              Ativa
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-mono mt-0.5">{detectedGoogleEmail}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Sincronizar como Administrador Geral</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </button>

                    <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                      <button
                        type="button"
                        onClick={() => setUseOtherGoogleAccount(true)}
                        className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline cursor-pointer"
                      >
                        Ou utilizar outro e-mail do Gmail / Google Workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Introduzir Outra Conta Google:
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseOtherGoogleAccount(false)}
                        className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        Voltar à conta detetada
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-medium">Nome no Google</label>
                        <input
                          type="text"
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="Ex: Carlos Oliveira"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-medium">Endereço de E-mail Google (@gmail.com)</label>
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="carlos.oliveira@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
                            alert('Por favor, introduza um e-mail válido do Google.');
                            return;
                          }
                          handleGoogleAuth(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0]);
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <GoogleIcon className="w-4 h-4" />
                        <span>Sincronizar e Entrar com este Google</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy & Benefits Badge */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Benefícios da Sincronização Google:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    <li>Poupança de tempo: entrada instantânea com 1 clique</li>
                    <li>Criação automática da conta efetiva com perfil atribuído</li>
                    <li>Sessão protegida por padrão com registo em trilha de auditoria</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-600">
        INVENTA KAF © {new Date().getFullYear()} — Todos os direitos reservados.
      </footer>
    </div>
  );
};
