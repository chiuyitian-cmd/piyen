import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { BookingForm, TABLES } from './components/BookingForm';
import { MyReservations } from './components/MyReservations';
import { WarmMessage } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Compass, 
  Calendar, 
  LogOut, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Info,
  Menu,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Quote,
  Clock,
  FileText,
  RotateCcw
} from 'lucide-react';

function Dashboard() {
  const { user, userProfile, logout, signInWithGoogle, registerWithEmail, loginWithEmail, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeFeedback, setActiveFeedback] = useState<WarmMessage | null>(null);
  
  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);

  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRefreshList = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSuccess = (praise: WarmMessage) => {
    setActiveFeedback(praise);
  };

  const handleFailure = (mock: WarmMessage) => {
    setActiveFeedback(mock);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFormLoading(true);

    try {
      if (isRegistering) {
        if (!authName.trim()) {
          throw new Error('請輸入您的尊稱，好讓我們的主廚認識您！');
        }
        if (authPassword.length < 6) {
          throw new Error('密碼安全度不足，至少需填寫 6 位字元。');
        }
        await registerWithEmail(authEmail, authPassword, authName);
      } else {
        await loginWithEmail(authEmail, authPassword);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || '驗證程序發生未知差錯';
      if (errMsg.includes('auth/email-already-in-use')) {
        errMsg = '此電子郵箱已被其他饕客註冊，請直接登入！';
      } else if (errMsg.includes('auth/invalid-credential') || errMsg.includes('auth/wrong-password')) {
        errMsg = '帳號或密碼填寫錯誤，亦或是您目前尚未註冊？';
      } else if (errMsg.includes('auth/invalid-email')) {
        errMsg = '請填寫格式正確的電子郵箱地址。';
      }
      setAuthError(errMsg);
    } finally {
      setAuthFormLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google 登入連線失敗');
    }
  };

  // -----------------------------------------------------
  // 1. RENDER LOADING STATE
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#4A443F] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-[#8C7851] border-t-transparent rounded-full animate-spin"></div>
        <h2 className="font-serif italic text-2xl text-[#8C7851] mt-6 tracking-wide animate-pulse">
          暖金膳閣正在鋪陳桌巾...
        </h2>
        <p className="text-xs text-[#a39b92] uppercase tracking-widest mt-2 font-mono">
          Loading authentication status
        </p>
      </div>
    );
  }

  // -----------------------------------------------------
  // 2. RENDER UNAUTHENTICATED (LOGIN / REGISTER)
  // -----------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#4A443F] flex items-center justify-center p-4 selection:bg-[#8C7851] selection:text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center mix-blend-overlay opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80')" }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full bg-[#FCFAF7] border border-[#EAE4D9] p-8 md:p-10 shadow-xl relative rounded-2xl overflow-hidden"
          id="auth-panel-card"
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8C7851] via-[#D1B894] to-[#8C7851]"></div>

          <div className="text-center mb-8">
            <h1 className="font-serif italic text-4xl text-[#8C7851] tracking-tight">Gourmet Garden</h1>
            <p className="text-[10px] uppercase tracking-widest mt-2 text-[#A39B92] font-semibold">
              Est. 2024 • 餐廳預約系統
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex border-b border-[#EAE4D9] mb-6">
            <button
              onClick={() => { setIsRegistering(false); setAuthError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all ${
                !isRegistering 
                  ? 'text-[#8C7851] border-b-2 border-[#8C7851]' 
                  : 'text-[#A39B92] hover:text-[#6B645E]'
              }`}
              id="auth-tab-login"
            >
              賓客登入
            </button>
            <button
              onClick={() => { setIsRegistering(true); setAuthError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-all ${
                isRegistering 
                  ? 'text-[#8C7851] border-b-2 border-[#8C7851]' 
                  : 'text-[#A39B92] hover:text-[#6B645E]'
              }`}
              id="auth-tab-register"
            >
              註冊新帳號
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6B645E] uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#8C7851]" />
                  您的姓名 display name
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：Julian Dubois"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full text-sm p-3 bg-white border border-[#EAE4D9] rounded-xl outline-none focus:border-[#8C7851] text-[#4A443F] transition-all"
                  id="auth-input-name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6B645E] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C7851]" />
                電子信箱 email
              </label>
              <input
                type="email"
                required
                placeholder="yourname@domain.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full text-sm p-3 bg-white border border-[#EAE4D9] rounded-xl outline-none focus:border-[#8C7851] text-[#4A443F] transition-all"
                id="auth-input-email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6B645E] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8C7851]" />
                設定密碼 password
              </label>
              <input
                type="password"
                required
                placeholder="輸入安全密碼（至少 6 位字元）"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full text-sm p-3 bg-white border border-[#EAE4D9] rounded-xl outline-none focus:border-[#8C7851] text-[#4A443F] transition-all"
                id="auth-input-password"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-shake" id="auth-error-msg">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authFormLoading}
              className="w-full bg-[#8C7851] text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#736240] transition-colors shadow-md shadow-[#8C7851]/10 disabled:bg-[#A39B92] cursor-pointer"
              id="auth-btn-submit"
            >
              {authFormLoading ? '安全驗證中...' : isRegistering ? '註冊尊貴席位帳號' : '登入暖金膳閣'}
            </button>
          </form>

          {/* Google Login Section */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE4D9]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FCFAF7] px-3 text-[#A39B92] font-semibold tracking-wider">或者是</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignInClick}
            type="button"
            className="w-full py-3 border border-[#D9D1C5] hover:bg-[#F5F1E9] bg-white rounded-xl text-sm font-semibold text-[#6B645E] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            id="auth-btn-google"
          >
            {/* Google Vector Icon */}
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 帳號快速登入
          </button>
        </motion.div>
      </div>
    );
  }

  // -----------------------------------------------------
  // 3. RENDER AUTHENTICATED WEB APP (EDITORIAL AESTHETIC)
  // -----------------------------------------------------
  const userInitials = (userProfile?.displayName || user.displayName || 'JD')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isGoogleProvider = user.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="bg-[#F9F7F2] text-[#4A443F] font-sans min-h-screen flex flex-col md:flex-row overflow-x-hidden select-none">
      
      {/* ----------------- MOBILE MENU TOGGLE HEADER ----------------- */}
      <header className="md:hidden bg-[#FCFAF7] border-b border-[#EAE4D9] px-6 py-4 flex items-center justify-between z-40 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-serif italic text-2xl text-[#8C7851]">Gourmet Garden</h1>
          <p className="text-[9px] uppercase tracking-widest text-[#A39B92]">Est. 2024 • Elegant Dining</p>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-2 border border-[#EAE4D9] rounded-lg text-[#6B645E] hover:bg-[#F5F1E9]"
          id="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ----------------- ASIDE / SIDEBAR NAVIGATION ----------------- */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        z-30 w-64 border-r border-[#EAE4D9] flex flex-col h-full bg-[#FCFAF7] shadow-lg md:shadow-none shrink-0
      `}>
        {/* Brand visual header inside Sidebar */}
        <div className="p-8 hidden md:block">
          <h1 className="font-serif italic text-3xl text-[#8C7851] tracking-tight">Gourmet Garden</h1>
          <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 text-[#6B645E] font-medium">
            Est. 2024 • Reservation System
          </p>
        </div>

        {/* Sidebar Nav Area */}
        <nav className="flex-1 px-4 py-8 md:py-0 space-y-1">
          <a 
            href="#booking-container-card" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-4 py-3 text-sm font-medium bg-[#F0EBE0] text-[#8C7851] rounded-lg"
          >
            <Compass className="w-5 h-5 mr-3" />
            餐廳訂位大廳
          </a>
          <a 
            href="#reservations-list-container" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-4 py-3 text-sm font-medium text-[#6B645E] hover:bg-[#F5F1E9] rounded-lg transition-all"
          >
            <Calendar className="w-5 h-5 mr-3" />
            查看預約日程
          </a>
          
          {/* Editorial info blurb in sidebar */}
          <div className="pt-6 px-4 hidden md:block">
            <div className="border border-dashed border-[#EAE4D9] rounded-xl p-4 bg-[#F9F7F2]/50 text-[11px] leading-relaxed italic text-[#6B645E]">
              <Quote className="w-3.5 h-3.5 text-[#8C7851]/40 mb-1.5" />
              「食物不僅填飽肚子，更點亮靈魂。挑選一個典雅的席位，犒賞您尊貴無比的舌尖。」
            </div>
          </div>
        </nav>

        {/* Sidebar Account block */}
        <div className="p-6 border-t border-[#EAE4D9]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E8E2D9] border-2 border-white flex items-center justify-center text-xs font-bold text-[#8C7851]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#4A443F] truncate">{userProfile?.displayName || user.displayName || '賓客'}</p>
              <p className="text-[9px] text-[#A39B92] truncate">
                {isGoogleProvider ? 'Authenticated via Google' : 'Authenticated via Email'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest border border-[#D9D1C5] text-[#8C7851] rounded-lg hover:bg-[#8C7851] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            安全登出 Logout
          </button>
        </div>
      </aside>

      {/* Background overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#4A443F]/20 backdrop-blur-xs z-20 md:hidden"
        ></div>
      )}

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar */}
        <header className="h-20 border-b border-[#EAE4D9] flex items-center justify-between px-6 md:px-12 bg-white/50 backdrop-blur-xs shrink-0">
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="text-xs font-bold uppercase tracking-widest text-[#8C7851] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              台北 • 暖金膳閣 (Taipei, Taiwan)
            </div>
            <div className="text-xs text-[#A39B92] hidden sm:block">
              Table Reservation Engine Active
            </div>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setActiveFeedback(null);
                setTimeout(() => {
                  const el = document.getElementById('booking-container-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-5 py-2 bg-[#8C7851] text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg shadow-[#8C7851]/20 hover:bg-[#736240] transition-colors"
            >
              馬上訂位 Book Now
            </button>
          </div>
        </header>

        {/* Dynamic section body */}
        <AnimatePresence mode="wait">
          {activeFeedback ? (
            /* ----------------- BOOKING RESULT OVERLAY PAGE ("下一頁" 成功或失敗) ----------------- */
            <motion.section
              key="result-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#F9F7F2] flex flex-col items-center justify-start min-h-0"
              id="booking-result-screen"
            >
              <div className="max-w-2xl w-full py-4 space-y-8">
                {/* Elegant Editorial Header */}
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C7851] uppercase bg-[#EAE4D9]/40 px-3 py-1 rounded-full border border-[#D9D1C5]" id="result-status-badge">
                    {activeFeedback.type === 'praise' ? 'Reservation Confirmed • 席位保留成功' : 'Reservation Not Established • 席位狀態通知'}
                  </span>
                  <h2 className="font-serif italic text-3xl md:text-5xl text-[#4A443F] mt-4 font-semibold" id="result-page-title">
                    {activeFeedback.type === 'praise' ? '一場感官雅宴，即將揭幕' : '膳閣裁決，百味生活'}
                  </h2>
                  <p className="text-[10px] text-[#A39B92] uppercase tracking-widest leading-relaxed">
                    {activeFeedback.type === 'praise' ? 'A sensory masterpiece awaits your distinguished presence' : 'A momentary pause in your fine dining schedule'}
                  </p>
                </div>

                {/* Elegant Menu / Ticket Stub Card */}
                <div className="bg-white border border-[#EAE4D9] rounded-3xl shadow-xl overflow-hidden relative" id="result-ticket-card">
                  {/* Decorative status bar */}
                  <div className={`h-2 w-full ${activeFeedback.type === 'praise' ? 'bg-emerald-500' : 'bg-amber-600/60'}`}></div>
                  
                  <div className="p-6 md:p-10 space-y-8">
                    {/* Header Stamp block */}
                    <div className="flex justify-between items-start border-b border-dashed border-[#EAE4D9] pb-6">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#A39B92] uppercase font-bold tracking-widest font-mono">
                          Gourmet Garden Official Receipt
                        </span>
                        <h3 className={`text-xl font-bold font-serif ${activeFeedback.type === 'praise' ? 'text-emerald-800' : 'text-amber-950'}`}>
                          {activeFeedback.type === 'praise' ? '🍽️ 客主訂席圓滿確立' : '⚠️ 預訂狀態異動 / 駁回'}
                        </h3>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeFeedback.type === 'praise' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>
                        {activeFeedback.type === 'praise' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                    </div>

                    {/* Feedback Sayings (Praise or Sarcasm) */}
                    <div className="bg-[#FCFAF7] border-l-4 border-[#8C7851] p-5 rounded-r-2xl relative">
                      <Quote className="absolute -top-3 -left-1 w-8 h-8 text-[#8C7851]/10 transform -rotate-180" />
                      <p className="text-sm text-[#4A443F] leading-relaxed italic font-medium relative z-10 font-serif" id="result-feedback-text">
                        {activeFeedback.text}
                      </p>
                    </div>

                    {/* Reservation properties receipt list */}
                    {activeFeedback.bookingDetails && (
                      <div className="border border-dashed border-[#EAE4D9] bg-[#FAF8F5]/30 rounded-2xl p-5 space-y-4" id="result-booking-details-stub">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8C7851] border-b border-[#F0EBE0] pb-2 uppercase tracking-wider">
                          <FileText className="w-4 h-4" />
                          席位專屬憑證 / Booking Stub Details
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#A39B92] uppercase font-bold block tracking-wider">進膳日期 Date</span>
                            <div className="font-semibold text-[#4A443F] flex items-center gap-2" id="result-detail-date">
                              <Calendar className="w-4 h-4 text-[#8C7851]" />
                              {activeFeedback.bookingDetails.date}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-[#A39B92] uppercase font-bold block tracking-wider">進膳時段 Time</span>
                            <div className="font-semibold text-[#4A443F] flex items-center gap-2" id="result-detail-time">
                              <Clock className="w-4 h-4 text-[#8C7851]" />
                              {activeFeedback.bookingDetails.time} ({parseInt(activeFeedback.bookingDetails.time.split(':')[0]) < 15 ? '正午雅席 (Lunch)' : '暮色雅宴 (Dinner)'})
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-[#A39B92] uppercase font-bold block tracking-wider">客席座號 Table</span>
                            <div className="font-semibold text-[#4A443F] flex items-center gap-2" id="result-detail-table">
                              <Utensils className="w-4 h-4 text-[#8C7851]" />
                              桌號 #{activeFeedback.bookingDetails.tableNumber}
                              {(() => {
                                const tableConfig = TABLES.find(t => t.number === activeFeedback.bookingDetails?.tableNumber);
                                return tableConfig ? ` — ${tableConfig.description.split('】')[0].replace('【', '')}` : '';
                              })()}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-[#A39B92] uppercase font-bold block tracking-wider">賓席人數 Guests</span>
                            <div className="font-semibold text-[#4A443F] flex items-center gap-2" id="result-detail-guests">
                              <UserIcon className="w-4 h-4 text-[#8C7851]" />
                              {activeFeedback.bookingDetails.partySize} 位尊客席位
                            </div>
                          </div>
                        </div>

                        {/* Extra description text */}
                        {(() => {
                          const tableConfig = TABLES.find(t => t.number === activeFeedback.bookingDetails?.tableNumber);
                          const tableDesc = tableConfig ? tableConfig.description.split('】')[1] : null;
                          return tableDesc ? (
                            <div className="text-[11px] text-[#A39B92] leading-relaxed italic pt-3 border-t border-[#F0EBE0] flex items-start gap-1">
                              <Info className="w-3.5 h-3.5 text-[#8C7851]/60 shrink-0 mt-0.5" />
                              <span>客席特色：{tableDesc}</span>
                            </div>
                          ) : null;
                        })()}

                        {activeFeedback.bookingDetails.reservationId && (
                          <div className="pt-1 text-[9px] font-mono text-[#D1C8BD] text-right">
                            REF NO: {activeFeedback.bookingDetails.reservationId}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Food pun & Chef's secret quote block */}
                    {(activeFeedback.foodPun || activeFeedback.chefQuote) && (
                      <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-5 space-y-3" id="result-interaction-quote-block">
                        {activeFeedback.foodPun && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">
                              舌尖趣味 Food Pun
                            </span>
                            <p className="text-xs text-[#6B645E] italic leading-relaxed pl-1 mt-1 font-medium">
                              {activeFeedback.foodPun}
                            </p>
                          </div>
                        )}
                        
                        {activeFeedback.chefQuote && (
                          <div className="pt-2 border-t border-amber-100/40">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#A39B92] block">
                              主廚私房叮嚀 Chef Quote
                            </span>
                            <p className="font-serif italic text-xs text-[#8C7851] pl-1 mt-1">
                              {activeFeedback.chefQuote}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions button group */}
                    <div className="pt-6 border-t border-[#EAE4D9]/60 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setActiveFeedback(null)}
                        className="flex-1 bg-[#8C7851] text-white py-3 md:py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#736240] transition-colors shadow-lg shadow-[#8C7851]/15 cursor-pointer flex items-center justify-center gap-2"
                        id="result-back-to-lobby-btn"
                      >
                        <Compass className="w-4 h-4" />
                        返回餐廳大廳 / 繼續預定
                      </button>
                      <button
                        onClick={() => {
                          setActiveFeedback(null);
                          setTimeout(() => {
                            const el = document.getElementById('reservations-list-container');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="flex-1 py-3 md:py-3.5 border border-[#D9D1C5] hover:bg-[#F5F1E9] text-[#6B645E] rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        id="result-view-schedule-btn"
                      >
                        <Calendar className="w-4 h-4" />
                        查看我的預約日程
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            /* ----------------- ORIGINAL BOOKING LOBBY STAGE (訂位首頁) ----------------- */
            <motion.section
              key="lobby-page"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 p-6 md:p-12 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header / Intro */}
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-5xl font-serif text-[#4A443F] leading-tight">
                    歡迎回來，{userProfile?.displayName || user.displayName || '親愛的饕客'}。
                    <br />
                    <span className="italic text-[#8C7851]">頂級美饌的烹調舞台，已準備就緒。</span>
                  </h2>
                  <p className="text-[#6B645E] text-xs max-w-xl leading-relaxed">
                    不論是微光漫溢的窗邊雙人座、抑或是寬大雍容的貴賓包廂，我們皆為品味不凡的您提供即時線上定位保障。
                  </p>
                </div>

                {/* Two column layout: Booking form and My Reservations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Form: BookingForm */}
                  <div className="lg:col-span-7">
                    <BookingForm 
                      onSuccess={handleSuccess} 
                      onFailure={handleFailure} 
                      onRefreshList={handleRefreshList} 
                    />
                  </div>

                  {/* Right List: My Reservations */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Visual Editorial card */}
                    <div className="bg-[#FCFAF7] border border-[#EAE4D9] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-[#EAE4D9] text-[#8C7851] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                          Chef Spotlight • 首席私房
                        </span>
                        <Sparkles className="w-4 h-4 text-[#8C7851]" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#4A443F]">
                        「唯有極致執著，方能成就絕頂美味」
                      </h3>
                      <p className="text-xs text-[#6B645E] leading-relaxed italic">
                        暖金膳閣不接受機器人定時搶座、或不負責任取消保留！每一張餐桌在其時段之內皆凝聚了烹調匠心，並指派專任侍者竭力服侍。
                      </p>
                    </div>

                    <MyReservations 
                      onSuccess={handleSuccess}
                      onFailure={handleFailure}
                      refreshTrigger={refreshTrigger}
                      onRefreshTrigger={handleRefreshList}
                    />
                  </div>

                </div>

                {/* Quick Stats / Editorial Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pt-12 border-t border-[#EAE4D9]/80 gap-6">
                  <div className="flex space-x-12">
                    <div>
                      <span className="block text-4xl font-serif text-[#8C7851] font-semibold">5 席</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39B92]">黃金殿堂級桌款</span>
                    </div>
                    <div>
                      <span className="block text-4xl font-serif text-[#8C7851] font-semibold">100%</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39B92]">主廚堅持手工現做</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right max-w-xs">
                    <p className="text-[11px] leading-relaxed text-[#6B645E] italic">
                      "Cooking is like love. It should be entered into with abandonment or not at all." — Harriet van Horne
                    </p>
                  </div>
                </div>

              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
