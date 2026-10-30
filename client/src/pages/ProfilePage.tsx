import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Check,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../services/api';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/Badge';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { resolvedMode, palette } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isDark = resolvedMode === 'dark';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'completed' | 'returned'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Return Request Modal State
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('wrong_size');
  const [returnNote, setReturnNote] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    ordersApi
      .getMyOrders()
      .then((data) => {
        setOrders(data);
        if (data.length > 0) {
          setExpandedOrderId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        showToast('Lỗi khi tải dữ liệu đơn hàng.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, showToast]);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${palette.borderClass} ${palette.textClass} ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold">{t('user.greeting')}</h2>
        <p className="text-xs text-zinc-400">
          {language === 'vi'
            ? 'Vui lòng đăng nhập để truy cập Hồ Sơ Cá Nhân và quản lý các đơn hàng, yêu cầu đổi trả.'
            : 'Please sign in to access your Customer Profile, orders, and return requests.'}
        </p>
        <Link
          to="/login?redirect=/profile"
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`}
        >
          <span>{t('nav.login')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Calculate user stats
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_price, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const shippingCount = orders.filter((o) => o.status === 'shipping').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const returnedCount = orders.filter((o) => o.status === 'return_requested' || o.status === 'returned').length;

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'shipping') return order.status === 'shipping';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'returned') return order.status === 'return_requested' || order.status === 'returned';
    return true;
  });

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Submit Return Request
  const handleConfirmReturn = async () => {
    if (!returnModalOrder) return;
    setSubmittingReturn(true);
    try {
      const updated = await ordersApi.requestReturn(returnModalOrder.id);
      showToast(
        language === 'vi'
          ? `Đã gửi yêu cầu trả hàng cho đơn #${returnModalOrder.id}. Chuyên viên CSKH sẽ liên hệ sớm!`
          : `Return request submitted for Order #${returnModalOrder.id}. Our concierge will contact you shortly!`,
        'success'
      );
      setOrders((prev) => prev.map((o) => (o.id === returnModalOrder.id ? updated : o)));
      setReturnModalOrder(null);
      setReturnNote('');
    } catch (err: any) {
      console.error('Failed to submit return request', err);
      showToast(
        err.response?.data?.detail || (language === 'vi' ? 'Không thể gửi yêu cầu trả hàng.' : 'Failed to request return.'),
        'error'
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Header Profile Banner */}
      <section
        className={`relative rounded-3xl p-6 sm:p-10 border overflow-hidden backdrop-blur-xl shadow-xl ${
          isDark
            ? 'bg-zinc-950/70 border-zinc-800/80'
            : 'bg-white border-zinc-200'
        }`}
        style={{
          boxShadow: `0 10px 30px -10px ${palette.glow}`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center font-bold text-3xl text-zinc-950 shadow-lg`}
            >
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user?.username}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${palette.borderClass} ${palette.textClass} bg-zinc-900/60`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>VIP Concierge Member</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{user?.email}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${palette.textClass}`} />
                <span>
                  {language === 'vi'
                    ? 'Đặc quyền: Miễn phí vận chuyển hỏa tốc & Stylist AI tư vấn độc quyền'
                    : 'Privilege: Complimentary white-glove express delivery & 24/7 bespoke styling'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black'
              }`}
            >
              {language === 'vi' ? 'Tiếp tục mua sắm' : 'Explore Collections'}
            </Link>
          </div>
        </div>

        {/* 4 Quick Stat Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/40">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
              {language === 'vi' ? 'Tổng chi tiêu' : 'Total Investment'}
            </span>
            <span className={`font-serif text-lg font-bold ${palette.textClass} block mt-0.5`}>
              {formatCurrency(totalSpent)}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
              {language === 'vi' ? 'Tổng đơn hàng' : 'Total Orders'}
            </span>
            <span className="font-serif text-lg font-bold block mt-0.5">
              {orders.length}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
              {language === 'vi' ? 'Đang vận chuyển' : 'In Transit'}
            </span>
            <span className="font-serif text-lg font-bold text-sky-400 block mt-0.5">
              {shippingCount}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
              {language === 'vi' ? 'Yêu cầu đổi trả' : 'Returns & Refunds'}
            </span>
            <span className="font-serif text-lg font-bold text-purple-400 block mt-0.5">
              {returnedCount}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Order Tracking & Returns Hub */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              {language === 'vi' ? 'Quản Lý Đơn Hàng & Đổi Trả' : 'Order & Return Management'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {language === 'vi'
                ? 'Theo dõi lộ trình giao nhận, xem chi tiết và yêu cầu trả hàng trực tiếp cho các đơn hàng của bạn.'
                : 'Track deliveries, review items, and initiate return requests directly.'}
            </p>
          </div>
        </div>

        {/* Filter Tabs by Order Status (Giao diện thẻ rõ ràng theo yêu cầu) */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md font-bold`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Tất cả' : 'All Orders'} ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md font-bold`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Đang xử lý' : 'Pending'} ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'shipping'
                ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md font-bold`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Đang giao' : 'Shipping'} ({shippingCount})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md font-bold`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Đã giao' : 'Delivered'} ({completedCount})
          </button>

          <button
            onClick={() => setActiveTab('returned')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'returned'
                ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md font-bold`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Đổi trả / Hoàn tiền' : 'Returns & Refunds'} ({returnedCount})
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: palette.primary, borderTopColor: 'transparent' }}
            />
            <p className="text-xs text-zinc-400 font-serif">Đang tra cứu dữ liệu hồ sơ...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className={`py-16 text-center rounded-3xl border space-y-4 ${
              isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDark ? 'bg-zinc-800/60 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold">
              {language === 'vi' ? 'Không có đơn hàng nào trong mục này' : 'No orders found in this section'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {language === 'vi'
                ? 'Hãy khám phá các thiết kế thời trang thượng hạng mới nhất của LuxeStyle.'
                : 'Browse our latest bespoke collections and add luxury pieces to your cart.'}
            </p>
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'vi' ? 'Mua sắm ngay' : 'Shop Now'}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isEligibleForReturn = order.status === 'completed' || order.status === 'shipping';
              const isReturnRequested = order.status === 'return_requested';
              const isReturned = order.status === 'returned';

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700/80'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                  }`}
                >
                  {/* Order Summary Bar */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-zinc-800/10"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${palette.borderClass} ${palette.textClass} ${isDark ? 'bg-zinc-800/80' : 'bg-zinc-100'}`}>
                        #{order.id}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-sm font-bold">
                            {language === 'vi' ? 'Đơn hàng' : 'Order'} #{order.id}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{formatDate(order.created_at)}</span>
                          <span className="mx-1">•</span>
                          <span>{order.order_items.length} {language === 'vi' ? 'sản phẩm' : 'items'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-zinc-400 block uppercase">
                          {language === 'vi' ? 'Tổng thanh toán' : 'Total'}
                        </span>
                        <span className={`font-serif text-base font-bold ${palette.textClass}`}>
                          {formatCurrency(order.total_price)}
                        </span>
                      </div>

                      <button
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}
                        title={isExpanded ? 'Thu gọn' : 'Chi tiết'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Visual Stepper / Progress Tracking */}
                  <div className={`px-5 py-3 border-t text-xs flex items-center justify-between ${isDark ? 'border-zinc-800/50 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50/50'}`}>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 font-medium">
                            {language === 'vi' ? 'Đơn hàng đã được tiếp nhận, đang đóng gói chuẩn hộp quà.' : 'Order received, boutique packaging in progress.'}
                          </span>
                        </>
                      )}
                      {order.status === 'shipping' && (
                        <>
                          <Truck className="w-4 h-4 text-sky-400" />
                          <span className="text-sky-400 font-medium">
                            {language === 'vi' ? 'Đơn hàng đang trên đường vận chuyển hỏa tốc đến quý khách.' : 'Concierge courier is delivering your order.'}
                          </span>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">
                            {language === 'vi' ? 'Đã giao thành công. Quý khách có 7 ngày để yêu cầu đổi size hoặc trả hàng.' : 'Delivered successfully. Eligible for 7-day flexible exchange or return.'}
                          </span>
                        </>
                      )}
                      {isReturnRequested && (
                        <>
                          <RotateCcw className="w-4 h-4 text-purple-400 animate-spin" />
                          <span className="text-purple-400 font-medium">
                            {language === 'vi' ? 'Đã gửi yêu cầu trả hàng. Đội ngũ CSKH đang xét duyệt hồ sơ hoàn tiền.' : 'Return request received. Concierge team is processing refund protocol.'}
                          </span>
                        </>
                      )}
                      {isReturned && (
                        <>
                          <Check className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 font-medium">
                            {language === 'vi' ? 'Đã hoàn tất thủ tục trả hàng & hoàn tiền về tài khoản của quý khách.' : 'Return & refund completed successfully.'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Nút Trả Hàng (Return Button) */}
                    <div>
                      {isEligibleForReturn && !isReturnRequested && !isReturned && (
                        <button
                          onClick={() => setReturnModalOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 transition-colors shadow-sm active:scale-95"
                          title="Yêu cầu trả hàng cho đơn này"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'vi' ? 'Yêu cầu trả hàng' : 'Request Return'}</span>
                        </button>
                      )}
                      {isReturnRequested && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {language === 'vi' ? 'Đang xét duyệt trả hàng' : 'Return Under Review'}
                        </span>
                      )}
                      {isReturned && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                          {language === 'vi' ? 'Đã hoàn tiền' : 'Refunded'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Items Breakdown */}
                  {isExpanded && (
                    <div className={`p-5 border-t space-y-4 ${isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-zinc-200 bg-white'}`}>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Sparkles className={`w-3.5 h-3.5 ${palette.textClass}`} />
                        <span>{language === 'vi' ? 'Danh sách sản phẩm chi tiết' : 'Purchased Items Breakdown'}</span>
                      </h4>

                      <div className="divide-y divide-zinc-800/50">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="py-3 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.product?.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-12 h-14 rounded-lg object-cover bg-zinc-950 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold truncate">
                                  {item.product?.name || `Sản phẩm #${item.product_id}`}
                                </p>
                                <p className="text-zinc-400 mt-0.5">
                                  {language === 'vi' ? 'Đơn giá:' : 'Price:'} {formatCurrency(item.price)} × {item.quantity}
                                </p>
                              </div>
                            </div>

                            <span className={`font-serif font-bold ${palette.textClass} shrink-0`}>
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. MODAL YÊU CẦU TRẢ HÀNG (RETURN REQUEST MODAL) */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setReturnModalOrder(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
          />

          <div
            className={`relative z-10 w-full max-w-lg rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl animate-slideUp ${
              isDark ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif text-lg font-bold">
                  {language === 'vi' ? 'Yêu Cầu Trả Hàng / Hoàn Tiền' : 'Request Order Return & Refund'}
                </h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${palette.borderClass} ${palette.textClass}`}>
                Đơn #{returnModalOrder.id}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {language === 'vi'
                ? 'LuxeStyle cam kết chính sách đổi trả linh hoạt trong 7 ngày. Quý khách vui lòng cho biết lý do để đội ngũ hỗ trợ nhanh nhất.'
                : 'LuxeStyle offers effortless 7-day return privileges. Please specify your reason so our concierge can assist promptly.'}
            </p>

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                {language === 'vi' ? 'Lý do hoàn trả:' : 'Return Reason:'}
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                }`}
              >
                <option value="wrong_size">Không vừa kích cỡ (Cần đổi size khác)</option>
                <option value="not_as_described">Sản phẩm không đúng với mong đợi / hình ảnh</option>
                <option value="defective">Phát hiện lỗi chế tác hoặc bao bì bị móp méo</option>
                <option value="change_mind">Đổi ý, muốn hoàn tiền hoặc đổi sang sản phẩm khác</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            {/* Note textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                {language === 'vi' ? 'Ghi chú thêm cho chuyên viên CSKH:' : 'Additional Notes for Concierge:'}
              </label>
              <textarea
                rows={3}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder={language === 'vi' ? 'Mô tả chi tiết mong muốn đổi size, hoàn tiền qua STK...' : 'Details about exchange or refund account...'}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                  isDark ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:text-black'
                }`}
              >
                {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={submittingReturn}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`}
              >
                {submittingReturn && <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                <span>{language === 'vi' ? 'Xác nhận gửi yêu cầu' : 'Confirm Return Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
