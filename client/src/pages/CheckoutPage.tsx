import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.username || 'Nguyễn Văn An');
  const [phone, setPhone] = useState('0988123456');
  const [email, setEmail] = useState(user?.email || 'customer@store.com');
  const [address, setAddress] = useState('72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1');
  const [city, setCity] = useState('TP. Hồ Chí Minh');
  const [note, setNote] = useState('Vui lòng gọi trước 15 phút khi giao.');

  // Payment method: 'cod' | 'vietqr' | 'momo'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr' | 'momo'>('cod');

  // Submitting state & Success state
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shippingFee = totalPrice >= 2000000 || totalPrice === 0 ? 0 : 50000;
  const grandTotal = totalPrice + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      showToast('Giỏ hàng của bạn đang trống.', 'error');
      navigate('/cart');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    setSubmitting(true);

    try {
      // If user is not authenticated yet, automatically login with demo customer account for seamless test experience
      if (!isAuthenticated) {
        try {
          await login('customer@store.com', 'customer123');
        } catch {
          // If login fails, redirect to login page
          navigate('/login?redirect=/checkout');
          return;
        }
      }

      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const newOrder = await ordersApi.create(payload);
      setPlacedOrder(newOrder);
      clearCart();
      showToast('Đặt hàng thành công! Cảm ơn quý khách.', 'success');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      const detail = err.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng thử lại sau.';
      setErrorMsg(detail);
      showToast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Success confirmation screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Đặt Hàng Thành Công
          </span>
          <h1 className="font-serif text-3xl font-bold text-white">
            Cảm Ơn Quý Khách Đã Mua Sắm!
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Mã đơn hàng của quý khách là <span className="text-amber-400 font-bold">#{placedOrder.id}</span>. Đơn hàng đang được bộ phận chuyên trách đóng gói và giao đến quý khách.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800 text-xs">
            <span className="text-zinc-400">Trạng thái đơn:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              Đang xử lý (Pending)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Người nhận:</span>
            <span className="text-zinc-200 font-semibold">{fullName} ({phone})</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Địa chỉ giao:</span>
            <span className="text-zinc-200 truncate max-w-[260px]">{address}, {city}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Phương thức:</span>
            <span className="text-zinc-200">
              {paymentMethod === 'cod'
                ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                : paymentMethod === 'vietqr'
                ? 'Chuyển khoản QR ngân hàng'
                : 'Ví điện tử MoMo'}
            </span>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
            <span className="text-xs text-zinc-400">Tổng thanh toán:</span>
            <span className="font-serif text-lg font-bold text-amber-400">
              {formatCurrency(placedOrder.total_price)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/orders"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            Xem lịch sử đơn hàng
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-100">Thanh Toán & Đặt Hàng</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Vui lòng kiểm tra thông tin nhận hàng và chọn phương thức thanh toán phù hợp.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Recipient Information */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Truck className="w-4 h-4 text-amber-400" />
              <h2 className="font-serif text-base font-bold text-zinc-100">
                1. Thông Tin Nhận Hàng
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988 123 456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Email nhận thông báo hóa đơn</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs text-zinc-400">Địa chỉ cụ thể (Số nhà, đường) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="72 Lê Thánh Tôn, Bến Nghé, Quận 1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Ghi chú giao hàng (Tùy chọn)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Gọi điện trước khi giao, gửi bảo vệ tòa nhà..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Mock Payment Methods */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h2 className="font-serif text-base font-bold text-zinc-100">
                2. Phương Thức Thanh Toán Giả Lập
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  paymentMethod === 'cod'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-400" />
                <p className="font-semibold text-xs text-zinc-200">COD Tiền Mặt</p>
                <p className="text-[10px] text-zinc-400">Thanh toán khi nhận hàng tại nhà</p>
              </button>

              {/* VietQR */}
              <button
                type="button"
                onClick={() => setPaymentMethod('vietqr')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  paymentMethod === 'vietqr'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-400" />
                <p className="font-semibold text-xs text-zinc-200">Chuyển Khoản QR</p>
                <p className="text-[10px] text-zinc-400">Quét mã QR qua ứng dụng ngân hàng</p>
              </button>

              {/* E-Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('momo')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  paymentMethod === 'momo'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400" />
                <p className="font-semibold text-xs text-zinc-200">Ví Điện Tử</p>
                <p className="text-[10px] text-zinc-400">MoMo / ZaloPay tiện lợi</p>
              </button>
            </div>

            {/* QR Code Demo Box */}
            {paymentMethod === 'vietqr' && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
                <div className="w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-20 h-20 text-black" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-200">Ngân hàng TMCP Quân Đội (MB Bank)</p>
                  <p className="text-zinc-400">Số tài khoản: <span className="text-amber-400 font-mono font-bold">9999.8888.6666</span></p>
                  <p className="text-zinc-400">Chủ tài khoản: <span className="text-zinc-200 uppercase font-semibold">LUXESTYLE BOUTIQUE</span></p>
                  <p className="text-zinc-400">Nội dung: <span className="text-amber-400 font-mono">DH_LUXE_ONLINE</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Items Summary & Submit Button */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-md space-y-6 sticky top-28">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-zinc-100">Kiểm Tra Đơn Hàng</h3>
          </div>

          {/* List of items */}
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={product.image_url || ''}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-950 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{product.name}</p>
                    <p className="text-zinc-500">Số lượng: x{quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-amber-400 shrink-0">
                  {formatCurrency(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Calculation */}
          <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Tạm tính:</span>
              <span className="text-zinc-200">{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Phí vận chuyển:</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-400 font-medium">Miễn phí</span>
                ) : (
                  formatCurrency(shippingFee)
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-zinc-100">Tổng thanh toán:</span>
              <span className="font-serif text-xl font-bold text-amber-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đặt hàng...</span>
              </div>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Xác Nhận Đặt Hàng</span>
              </>
            )}
          </button>

          <div className="pt-2 flex items-center gap-2 text-zinc-400 text-[11px] justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dữ liệu được mã hóa chuẩn SSL 256-bit</span>
          </div>
        </div>
      </form>
    </div>
  );
};
