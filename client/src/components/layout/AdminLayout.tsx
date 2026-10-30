import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LuxuryBackground } from '../common/LuxuryBackground';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 font-serif">Đang xác thực quyền Quản trị...</p>
        </div>
      </div>
    );
  }

  // 2. Not Authenticated -> Redirect to login
  if (!isAuthenticated || !user) {
    navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    return null;
  }

  // 3. Authenticated but not Admin -> 403 Forbidden UI
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-rose-500/30 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">403 • Truy Cập Bị Từ Chối</h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Tài khoản <span className="text-amber-400 font-semibold">{user.email}</span> chỉ có vai trò khách hàng và không có quyền truy cập vào phân hệ Quản trị Viên.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors"
            >
              Về Trang Mua Sắm
            </Link>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Links
  const navItems = [
    {
      name: 'Tổng Quan',
      path: '/admin',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: 'Quản Lý Sản Phẩm',
      path: '/admin/products',
      exact: false,
      icon: Package,
    },
    {
      name: 'Quản Lý Đơn Hàng',
      path: '/admin/orders',
      exact: false,
      icon: ShoppingBag,
    },
  ];

  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="relative min-h-screen text-zinc-100 flex flex-col md:flex-row overflow-x-hidden">
      <LuxuryBackground />

      {/* Mobile Header */}
      <div className="relative z-40 md:hidden flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#0d0e12]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-bold">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-serif font-bold text-lg text-white">LuxeAdmin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0d0e12]/85 backdrop-blur-2xl border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-zinc-800/80">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-wider block">
                  LUXESTYLE
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">
                  Admin Control Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Bảng điều khiển
            </div>
            {navItems.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Storefront Exit */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase border border-amber-500/30">
              {user.username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user.username}</p>
              <div className="flex items-center gap-1 text-[10px] text-amber-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem Cửa Hàng</span>
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex h-16 border-b border-zinc-800/80 px-8 items-center justify-between bg-[#0d0e12]/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-amber-400 font-medium capitalize">
              {location.pathname.replace('/admin', '') || 'Tổng quan'}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 hover:border-amber-500/40 transition-all"
          >
            <span>Trở về giao diện người dùng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
