import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Globe,
  Palette,
  Check,
  ChevronRight,
  Headphones,
  Home,
  Tag,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, ACCENT_PALETTES, AccentColor } from '../../context/ThemeContext';
import { categoriesApi } from '../../services/api';
import { Category } from '../../types';

export const Sidebar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const {
    mode,
    setMode,
    resolvedMode,
    accent,
    setAccent,
    palette,
    sidebarOpen,
    setSidebarOpen,
  } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);

  // Load product categories for the "Bộ sưu tập" section
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories for sidebar', err));
  }, []);

  // Close sidebar automatically on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search, setSidebarOpen]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  if (!sidebarOpen) return null;

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/');
  };

  const isDark = resolvedMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* 2. Slide-out Drawer Panel */}
      <aside
        className={`relative z-10 w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl transition-transform duration-300 ease-out animate-slideRight overflow-y-auto no-scrollbar ${
          isDark
            ? 'bg-[#0b0c13]/95 text-zinc-100 border-r border-zinc-800/80'
            : 'bg-[#ffffff]/95 text-zinc-900 border-r border-zinc-200'
        } backdrop-blur-2xl`}
        style={{
          boxShadow: `0 0 50px -10px ${palette.glow}`,
        }}
      >
        {/* Drawer Header */}
        <div
          className={`sticky top-0 z-20 px-6 py-5 flex items-center justify-between border-b ${
            isDark ? 'border-zinc-800/80 bg-[#0b0c13]/90' : 'border-zinc-200 bg-white/90'
          } backdrop-blur-xl`}
        >
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-black/20 group-hover:scale-105 transition-transform`}
            >
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wider block">
                {t('brand.name')}
              </span>
              <span className={`text-[9px] uppercase tracking-widest font-semibold ${palette.textClass}`}>
                {t('brand.slogan')}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-xl transition-all ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title={t('nav.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* SECTION A: TRUNG TÂM TÀI KHOẢN (CUSTOMER PROFILE HUB)
              User requested: Bấm vào hồ sơ cá nhân mới có đơn hàng, trả hàng, đang giao... chứ không để ở đây */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {language === 'vi' ? 'Trung Tâm Tài Khoản' : 'Account Center'}
              </span>
              {isAuthenticated && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${palette.borderClass} ${palette.textClass} bg-zinc-800/40`}
                >
                  {isAdmin ? t('user.admin_badge') : t('user.vip_badge')}
                </span>
              )}
            </div>

            {isAuthenticated && user ? (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 shadow-inner'
                    : 'bg-zinc-50 border-zinc-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center font-bold text-lg text-zinc-950 shadow-md`}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400">{t('user.greeting')}</p>
                    <h4 className="font-serif font-bold text-base truncate">{user.username}</h4>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4 pt-3 border-t border-zinc-800/50">
                  {/* Nút vào Trang Hồ Sơ Cá Nhân (Quản lý đơn hàng, đang giao, đã giao, trả hàng) */}
                  <Link
                    to="/profile"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname === '/profile'
                        ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                        : isDark
                        ? 'text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/60'
                        : 'text-zinc-800 hover:bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>{language === 'vi' ? 'Hồ Sơ Cá Nhân & Đơn Hàng' : 'My Profile & Orders'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                        isDark
                          ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>{t('nav.admin')}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`p-4 rounded-2xl border text-center space-y-3 ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800/80 shadow-inner'
                    : 'bg-zinc-50 border-zinc-200 shadow-sm'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center text-zinc-950 shadow-md`}
                >
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm">{t('user.guest')}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {t('user.login_prompt')}
                  </p>
                </div>

                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-950" />
                  <span>{t('nav.login')} / {t('nav.register')}</span>
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 font-mono text-[10px]">
                    admin@store.com
                  </span>
                  <span>|</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 font-mono text-[10px]">
                    customer@store.com
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: TÁC VỤ & KHÁM PHÁ (QUICK ACTIONS - RIÊNG BIỆT PHÍA NGOÀI)
              User requested: Trang chủ và giỏ hàng nên để riêng phía ngoài như 1 mục tác vụ riêng */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              {language === 'vi' ? 'Tác Vụ & Điều Hướng Nhanh' : 'Quick Actions'}
            </span>

            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/' && !location.search
                  ? `${isDark ? 'bg-zinc-800/80 text-white' : 'bg-zinc-100 text-zinc-950'} font-bold border ${palette.borderClass}`
                  : `${isDark ? 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'}`
              }`}
            >
              <span className="flex items-center gap-3">
                <Home className={`w-4 h-4 ${palette.textClass}`} />
                <span>{t('nav.home')}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <Link
              to="/cart"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/cart'
                  ? `${isDark ? 'bg-zinc-800/80 text-white' : 'bg-zinc-100 text-zinc-950'} font-bold border ${palette.borderClass}`
                  : `${isDark ? 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'}`
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className={`w-4 h-4 ${palette.textClass}`} />
                <span>{t('nav.cart')}</span>
              </span>
              <div className="flex items-center gap-2">
                {totalItems > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold text-zinc-950 bg-gradient-to-r ${palette.gradientClass} shadow-sm`}
                  >
                    {totalItems}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </Link>
          </div>

          {/* SECTION C: BỘ SƯU TẬP (DANH MỤC SẢN PHẨM BÀY BÁN)
              User requested: Bộ sưu tập thì nên là danh mục sản phẩm bày bán */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {language === 'vi' ? 'Bộ Sưu Tập (Danh Mục Bày Bán)' : 'Collections (Catalog Categories)'}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {categories.length} {language === 'vi' ? 'danh mục' : 'categories'}
              </span>
            </div>

            {/* Mục: Tất cả sản phẩm */}
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/' && !location.search
                  ? `border ${palette.borderClass} ${palette.textClass} bg-zinc-800/30`
                  : isDark ? 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className={`w-3.5 h-3.5 ${palette.textClass}`} />
                <span>{language === 'vi' ? 'Tất cả sản phẩm tinh tuyển' : 'All Curated Pieces'}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            {/* Các danh mục sản phẩm thực tế */}
            {categories.map((cat) => {
              const isActive = location.search.includes(`category_id=${cat.id}`);
              return (
                <Link
                  key={cat.id}
                  to={`/?category_id=${cat.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? `border ${palette.borderClass} ${palette.textClass} font-bold bg-zinc-800/40 shadow-sm`
                      : isDark
                      ? 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* SECTION D: Tùy Chỉnh Giao Diện & Ngôn Ngữ */}
          <div
            className={`p-4 rounded-2xl border space-y-4 ${
              isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Palette className={`w-4 h-4 ${palette.textClass}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('theme.title')}
              </span>
            </div>

            {/* 1. Ngôn ngữ */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('theme.language')}</span>
                </span>
                <span className="font-semibold text-zinc-300">
                  {language === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇬🇧'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-800/40 border border-zinc-800/50">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    language === 'vi'
                      ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>🇻🇳 Tiếng Việt</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    language === 'en'
                      ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>🇬🇧 English</span>
                </button>
              </div>
            </div>

            {/* 2. Chế độ hiển thị Sáng / Tối */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {mode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : mode === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                  <span>{t('theme.mode')}</span>
                </span>
                <span className="font-semibold text-zinc-300">
                  {mode === 'dark' ? t('theme.dark') : mode === 'light' ? t('theme.light') : t('theme.system')}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-800/40 border border-zinc-800/50">
                <button
                  onClick={() => setMode('dark')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'dark'
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tối</span>
                </button>

                <button
                  onClick={() => setMode('light')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'light'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sáng</span>
                </button>

                <button
                  onClick={() => setMode('system')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'system'
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tự động</span>
                </button>
              </div>
            </div>

            {/* 3. Bảng màu thượng lưu */}
            <div className="space-y-2 pt-1">
              <label className="text-xs text-zinc-400 flex items-center justify-between">
                <span>{t('theme.color_palette')}</span>
                <span className={`font-semibold ${palette.textClass}`}>
                  {language === 'vi' ? palette.nameVi : palette.nameEn}
                </span>
              </label>

              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((paletteKey) => {
                  const p = ACCENT_PALETTES[paletteKey];
                  const isActive = accent === paletteKey;
                  return (
                    <button
                      key={paletteKey}
                      onClick={() => setAccent(paletteKey)}
                      className={`group relative h-10 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-105 shadow-lg'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                        boxShadow: isActive ? `0 0 15px ${p.glow}` : 'none',
                      }}
                      title={language === 'vi' ? p.nameVi : p.nameEn}
                    >
                      {isActive && <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION E: VIP Concierge Hotline */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isDark ? 'bg-zinc-900/30 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <Headphones className={`w-4 h-4 ${palette.textClass}`} />
              <span className="font-semibold">{t('footer.hotline')}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('footer.authentic_desc')}
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          className={`p-4 text-center text-[10px] text-zinc-400 border-t ${
            isDark ? 'border-zinc-800/80 bg-[#0b0c13]' : 'border-zinc-200 bg-white'
          }`}
        >
          {t('footer.copyright')}
        </div>
      </aside>
    </div>
  );
};
