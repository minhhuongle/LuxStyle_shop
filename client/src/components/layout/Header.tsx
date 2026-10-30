import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  Moon,
  Sun,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { resolvedMode, toggleMode, palette, toggleSidebar } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const isDark = resolvedMode === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 backdrop-blur-2xl ${
        isDark
          ? 'bg-[#08090e]/75 border-zinc-800/60 text-zinc-100 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-white/80 border-zinc-200/80 text-zinc-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* 1. LEFT: Sidebar Trigger Button + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Nút mở Sidebar bên trái (Đẩy toàn bộ nội dung & tài khoản sang Sidebar) */}
          <button
            onClick={toggleSidebar}
            className={`flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-xl border transition-all active:scale-95 group ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-600 shadow-inner'
                : 'bg-zinc-100/80 border-zinc-200 text-zinc-800 hover:text-black hover:border-zinc-300'
            }`}
            style={{
              borderColor: undefined,
            }}
            title={t('nav.menu')}
          >
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-semibold tracking-wide">
              {t('nav.menu')}
            </span>
          </button>

          {/* Logo Thương Hiệu */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-300`}
            >
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider group-hover:opacity-90 transition-opacity">
                {t('brand.name')}
              </span>
              <span
                className={`text-[9px] uppercase tracking-widest font-semibold hidden lg:block ${palette.textClass}`}
              >
                {t('brand.slogan')}
              </span>
            </div>
          </Link>
        </div>

        {/* 2. CENTER: Quick Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-2 relative"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              className={`w-full rounded-full pl-10 pr-4 py-2 text-sm transition-all shadow-inner focus:outline-none focus:ring-1 ${palette.ringClass} ${
                isDark
                  ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600'
                  : 'bg-zinc-100/90 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400'
              }`}
            />
          </div>
        </form>

        {/* 3. RIGHT: Quick Switches & Account Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Nút Đổi Ngôn Ngữ Nhanh (VI / EN) */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                : 'bg-zinc-100/80 border-zinc-200 text-zinc-800 hover:text-zinc-950 hover:border-zinc-300'
            }`}
            title={language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
          >
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Nút Đổi Chế Độ Sáng / Tối Nhanh */}
          <button
            onClick={toggleMode}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-amber-400 hover:bg-zinc-800 hover:border-zinc-700'
                : 'bg-zinc-100/80 border-zinc-200 text-indigo-600 hover:bg-zinc-200 hover:border-zinc-300'
            }`}
            title={isDark ? t('theme.light') : t('theme.dark')}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Giỏ Hàng với Badge động */}
          <Link
            to="/cart"
            className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center group active:scale-95 ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                : 'bg-zinc-100/80 border-zinc-200 text-zinc-800 hover:text-black hover:border-zinc-300'
            }`}
            title={t('nav.cart')}
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-zinc-950 text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse bg-gradient-to-r ${palette.gradientClass}`}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* User Button: KHÔNG CÒN DROPDOWN GÂY RỐI! BẤM VÀO SẼ MỞ NGAY SIDEBAR BÊN TRÁI */}
          {isAuthenticated && user ? (
            <button
              onClick={toggleSidebar}
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all active:scale-95 ${
                isDark
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600'
                  : 'bg-zinc-100/90 border-zinc-200 hover:border-zinc-300'
              }`}
              title="Mở tài khoản trong Sidebar"
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${palette.gradientClass} text-zinc-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm`}
              >
                {user.username.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold text-xs max-w-[90px] truncate">
                {user.username}
              </span>
              {isAdmin && (
                <span className="hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Admin
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md bg-gradient-to-r ${palette.gradientClass} text-zinc-950`}
              title="Mở trung tâm đăng nhập"
            >
              <UserIcon className="w-4 h-4 text-zinc-950" />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
