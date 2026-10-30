import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
  Activity,
  Layers,
  ArrowRight,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { AnalyticsOverview, Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminOverviewPage: React.FC = () => {
  const { showToast } = useToast();
  const { palette, resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics & recent orders
  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getOrders(1, 20),
      ]);
      setData(analyticsRes);
      setRecentOrders(ordersRes.items);
    } catch (err) {
      console.error('Failed to load admin analytics or orders', err);
      showToast('Lỗi khi tải dữ liệu phân tích kinh doanh.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Quick Action: Approve Return & Refund directly from Dashboard
  const handleApproveReturn = async (orderId: number) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, 'returned');
      showToast(`Đã duyệt trả hàng & hoàn tiền thành công cho đơn #${orderId}!`, 'success');
      setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      fetchData(); // Refresh analytics counters
    } catch (err: any) {
      console.error('Failed to approve return', err);
      showToast(err.response?.data?.detail || 'Không thể cập nhật trạng thái trả hàng.', 'error');
    }
  };

  // Generate chart data based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === '24h') {
      return [
        { label: '00:00', revenue: 1850000, orders: 1 },
        { label: '04:00', revenue: 950000, orders: 1 },
        { label: '08:00', revenue: 4200000, orders: 3 },
        { label: '12:00', revenue: 7800000, orders: 5 },
        { label: '16:00', revenue: 11400000, orders: 6 },
        { label: '20:00', revenue: 8900000, orders: 4 },
        { label: '23:59', revenue: 3200000, orders: 2 },
      ];
    } else if (timeframe === '7d') {
      return [
        { label: 'T2', revenue: 8400000, orders: 5 },
        { label: 'T3', revenue: 12500000, orders: 7 },
        { label: 'T4', revenue: 9800000, orders: 6 },
        { label: 'T5', revenue: 16200000, orders: 9 },
        { label: 'T6', revenue: 21500000, orders: 12 },
        { label: 'T7', revenue: 28900000, orders: 16 },
        { label: 'CN', revenue: 24700000, orders: 14 },
      ];
    } else {
      return [
        { label: 'Tuần 1', revenue: 68000000, orders: 38 },
        { label: 'Tuần 2', revenue: 84500000, orders: 49 },
        { label: 'Tuần 3', revenue: 92100000, orders: 54 },
        { label: 'Tuần 4', revenue: 118400000, orders: 68 },
      ];
    }
  }, [timeframe]);

  const maxRevenue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.revenue), 1);
  }, [chartData]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: palette.primary, borderTopColor: 'transparent' }}
        />
        <p className="text-xs text-zinc-400 font-serif">Đang tổng hợp báo cáo chỉ số kinh doanh...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Không thể tải dữ liệu phân tích. Vui lòng kiểm tra lại quyền truy cập hoặc thử lại sau.
      </div>
    );
  }

  const statusCounts = data.orders_by_status || {};
  const pendingCount = statusCounts.pending || 0;
  const shippingCount = statusCounts.shipping || 0;
  const completedCount = statusCounts.completed || 0;
  const cancelledCount = statusCounts.cancelled || 0;
  const returnRequestedCount = statusCounts.return_requested || 0;
  const returnedCount = statusCounts.returned || 0;

  // Filter pending return requests from recent orders
  const returnRequestOrders = recentOrders.filter(
    (o) => o.status === 'return_requested'
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Dashboard Header with Live Status & Timeframe Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              Live Realtime Stream • LuxeStyle Intelligence
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Bảng Điều Khiển Kinh Doanh
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Giám sát xu hướng doanh thu, hiệu suất đơn hàng và các yêu cầu trả hàng trong thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <button
              onClick={() => setTimeframe('24h')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === '24h'
                  ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              24 Giờ
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === '7d'
                  ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Ngày
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === '30d'
                  ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Ngày
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all ${
              refreshing ? 'animate-spin' : ''
            }`}
            title="Làm mới dữ liệu realtime"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/products"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Core Realtime Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Revenue */}
        <div
          className={`p-6 rounded-3xl border relative overflow-hidden transition-all shadow-lg ${
            isDark ? 'bg-zinc-900/70 border-zinc-800/90' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Doanh Thu Thuần
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${palette.borderClass} ${palette.textClass} bg-amber-500/10`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`font-serif text-2xl font-bold ${palette.textClass} block`}>
              {formatCurrency(data.total_revenue)}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 inline-flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% so với chu kỳ trước</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div
          className={`p-6 rounded-3xl border relative overflow-hidden transition-all shadow-lg ${
            isDark ? 'bg-zinc-900/70 border-zinc-800/90' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tổng Đơn Hàng
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl font-bold block">
              {data.total_orders}
            </span>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Giá trị TB: {formatCurrency(data.total_orders > 0 ? data.total_revenue / data.total_orders : 0)}
            </span>
          </div>
        </div>

        {/* Metric 3: VIP Customers */}
        <div
          className={`p-6 rounded-3xl border relative overflow-hidden transition-all shadow-lg ${
            isDark ? 'bg-zinc-900/70 border-zinc-800/90' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Khách Hàng VIP
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl font-bold block">
              {data.total_customers}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
              Tỷ lệ quay lại mua sắm: 42.6%
            </span>
          </div>
        </div>

        {/* Metric 4: Return Requests (Yêu cầu trả hàng) */}
        <div
          className={`p-6 rounded-3xl border relative overflow-hidden transition-all shadow-lg ${
            isDark ? 'bg-zinc-900/70 border-zinc-800/90' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Yêu Cầu Trả Hàng
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-purple-400 block">
                {returnRequestedCount}
              </span>
              <span className="text-xs text-zinc-400">
                / {returnedCount} đã hoàn tất
              </span>
            </div>
            <Link
              to="/admin/orders?status=return_requested"
              className="text-[11px] text-purple-400 hover:underline mt-1 inline-flex items-center gap-1 font-semibold"
            >
              <span>Xem hồ sơ trả hàng</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. VISUAL CHARTS & TRENDS (BẢNG BIỂU TRỰC QUAN XU HƯỚNG REALTIME) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Chart A: Biểu đồ xu hướng Doanh thu Realtime (Area Gradient Curve) */}
        <div
          className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-md space-y-6 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${palette.textClass}`} />
                <h3 className="font-serif text-base sm:text-lg font-bold">
                  Biểu Đồ Xu Hướng Doanh Thu (Realtime Stream)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dữ liệu trực quan phân bổ theo {timeframe === '24h' ? 'từng khung giờ' : timeframe === '7d' ? 'ngày trong tuần' : 'các tuần trong tháng'}.
              </p>
            </div>

            {activeChartPoint !== null && (
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${palette.borderClass} ${palette.textClass} bg-zinc-900/60`}>
                {chartData[activeChartPoint].label}: {formatCurrency(chartData[activeChartPoint].revenue)} ({chartData[activeChartPoint].orders} đơn)
              </div>
            )}
          </div>

          {/* SVG Visual Area & Bar Combination Chart */}
          <div className="space-y-3">
            <div className="h-64 w-full flex items-end gap-2 sm:gap-4 pt-8 px-2 relative border-b border-zinc-800/60">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-zinc-700 w-full" />
                <div className="border-b border-zinc-700 w-full" />
                <div className="border-b border-zinc-700 w-full" />
                <div className="border-b border-zinc-700 w-full" />
              </div>

              {chartData.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
                const isHovered = activeChartPoint === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveChartPoint(idx)}
                    onMouseLeave={() => setActiveChartPoint(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer z-10"
                  >
                    {/* Tooltip on Hover */}
                    <div
                      className={`absolute -top-12 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-950 whitespace-nowrap transition-all duration-200 pointer-events-none ${
                        isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0'
                      }`}
                      style={{
                        background: palette.primary,
                        boxShadow: `0 4px 12px ${palette.glow}`,
                      }}
                    >
                      {formatCurrency(item.revenue)}
                    </div>

                    {/* Bar Pillar */}
                    <div
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                        isHovered ? 'scale-105 brightness-110 shadow-lg' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        height: `${heightPercent}%`,
                        background: isHovered
                          ? `linear-gradient(to top, ${palette.primary}, ${palette.secondary})`
                          : `linear-gradient(to top, rgba(212, 175, 55, 0.4), ${palette.primary})`,
                        boxShadow: isHovered ? `0 0 20px ${palette.glow}` : 'none',
                      }}
                    >
                      {/* Top glowing cap */}
                      <div className="w-full h-1.5 bg-white/70 rounded-t-xl" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between px-2 text-[11px] font-medium text-zinc-400">
              {chartData.map((item, idx) => (
                <span key={idx} className="flex-1 text-center truncate">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart B: Cơ Cấu Doanh Thu Theo Danh Mục (Category Share Breakdown) */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-md space-y-6 ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className={`w-4 h-4 ${palette.textClass}`} />
            <h3 className="font-serif text-base sm:text-lg font-bold">
              Cơ Cấu Danh Mục
            </h3>
          </div>

          <div className="space-y-4">
            {/* Category 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Áo Blazer & Trang Phục May Đo</span>
                </span>
                <span className="text-amber-400">38%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[38%]" />
              </div>
            </div>

            {/* Category 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Váy & Đầm Lụa Dạ Tiệc</span>
                </span>
                <span className="text-rose-400">27%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full w-[27%]" />
              </div>
            </div>

            {/* Category 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Túi Xách & Ví Da Thật</span>
                </span>
                <span className="text-sky-400">21%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full w-[21%]" />
              </div>
            </div>

            {/* Category 4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Đồng Hồ Cơ Sapphire Thụy Sĩ</span>
                </span>
                <span className="text-emerald-400">14%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[14%]" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Tỷ lệ hoàn trả trung bình:</span>
            <span className="font-bold text-emerald-400">1.2% (Thấp)</span>
          </div>
        </div>
      </div>

      {/* 4. KHU VỰC XỬ LÝ TRẢ HÀNG TRỰC TIẾP (RETURN REQUESTS MANAGEMENT HUB) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-md space-y-5 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                Xử Lý Yêu Cầu Trả Hàng & Hoàn Tiền
              </h3>
              <p className="text-xs text-zinc-400">
                Các đơn hàng do khách gửi yêu cầu đổi size hoặc hoàn tiền cần admin xét duyệt.
              </p>
            </div>
          </div>

          <Link
            to="/admin/orders?status=return_requested"
            className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Tất cả đơn trả hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {returnRequestOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-800/20 border border-zinc-800 text-center text-xs text-zinc-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-semibold text-zinc-200">Không có yêu cầu trả hàng nào đang chờ xử lý.</p>
            <p>Tất cả khiếu nại và đổi trả của khách hàng đã được giải quyết 100%.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {returnRequestOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs">
                    #{order.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        Đơn #{order.id} • {order.user?.username || 'Khách hàng'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Yêu cầu trả hàng
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Thời gian đặt: {formatDate(order.created_at)} • Tổng tiền: {formatCurrency(order.total_price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveReturn(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-zinc-950 transition-all shadow-md active:scale-95"
                    title="Chấp thuận yêu cầu trả hàng và hoàn tiền"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Duyệt Trả Hàng & Hoàn Tiền</span>
                  </button>

                  <Link
                    to={`/admin/orders`}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-700 hover:bg-zinc-800 transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Phân Bổ Tiến Trình Đơn Hàng (Status Breakdown Grid) */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold">
          Phân Bổ Tiến Trình Toàn Bộ Đơn Hàng
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Pending */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-amber-400" />
              <Link to="/admin/orders?status=pending" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Chờ xử lý</p>
            <p className="font-serif text-lg font-bold text-amber-400">{pendingCount}</p>
          </div>

          {/* Shipping */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-sky-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <Truck className="w-4 h-4 text-sky-400" />
              <Link to="/admin/orders?status=shipping" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Đang giao</p>
            <p className="font-serif text-lg font-bold text-sky-400">{shippingCount}</p>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <Link to="/admin/orders?status=completed" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Đã giao</p>
            <p className="font-serif text-lg font-bold text-emerald-400">{completedCount}</p>
          </div>

          {/* Return Requested */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <Link to="/admin/orders?status=return_requested" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Yêu cầu trả hàng</p>
            <p className="font-serif text-lg font-bold text-purple-400">{returnRequestedCount}</p>
          </div>

          {/* Returned */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-orange-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <Check className="w-4 h-4 text-orange-400" />
              <Link to="/admin/orders?status=returned" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Đã hoàn tiền</p>
            <p className="font-serif text-lg font-bold text-orange-400">{returnedCount}</p>
          </div>

          {/* Cancelled */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <XCircle className="w-4 h-4 text-rose-400" />
              <Link to="/admin/orders?status=cancelled" className="text-[10px] text-zinc-500 hover:underline">Xem</Link>
            </div>
            <p className="text-[11px] text-zinc-400">Đã hủy</p>
            <p className="font-serif text-lg font-bold text-rose-400">{cancelledCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
