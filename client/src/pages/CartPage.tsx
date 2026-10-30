import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { resolvedMode, palette } = useTheme();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const isDark = resolvedMode === 'dark';
  const shippingFee = totalPrice >= 2000000 || totalPrice === 0 ? 0 : 50000;
  const discountAmount = discountApplied ? totalPrice * 0.1 : 0;
  const grandTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'LUXE10') {
      setDiscountApplied(true);
    } else {
      alert(language === 'vi' ? 'Mã ưu đãi không hợp lệ. Hãy thử dùng mã LUXE10 để giảm 10%!' : 'Invalid code. Try LUXE10 for 10% privilege discount!');
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto shadow-inner ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-white border-zinc-200 text-zinc-400'
          }`}
        >
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold">{t('cart.empty_message')}</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {language === 'vi'
              ? 'Hãy khám phá các thiết kế thời trang thượng hạng và thêm những kiệt tác bạn yêu thích vào giỏ hàng.'
              : 'Explore our haute couture collections and select your preferred luxury pieces.'}
          </p>
        </div>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-lg`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('cart.continue_shopping')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div
        className={`flex items-center justify-between pb-6 border-b ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}
      >
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">{t('cart.title')}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'vi' ? 'Bạn đang có' : 'You have'}{' '}
            <span className={`font-semibold ${palette.textClass}`}>{totalItems}</span>{' '}
            {language === 'vi' ? 'món hàng trong giỏ' : 'items in your cart'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Xóa tất cả' : 'Clear all'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0">
                <Link to={`/products/${product.id}`} className="shrink-0">
                  <img
                    src={
                      product.image_url ||
                      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={product.name}
                    className="w-20 h-24 rounded-xl object-cover bg-zinc-950"
                  />
                </Link>

                <div className="min-w-0">
                  {product.category && (
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${palette.textClass}`}>
                      {product.category.name}
                    </span>
                  )}
                  <Link
                    to={`/products/${product.id}`}
                    className="block font-serif text-sm font-semibold hover:opacity-80 transition-opacity truncate"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-1">
                    {language === 'vi' ? 'Đơn giá:' : 'Unit price:'}{' '}
                    <span className="font-medium text-zinc-300">{formatCurrency(product.price)}</span>
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div
                className={`flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 ${
                  isDark ? 'border-zinc-800/80' : 'border-zinc-200'
                }`}
              >
                {/* Quantity Changer */}
                <div
                  className={`flex items-center border rounded-xl overflow-hidden ${
                    isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <span className={`font-serif text-sm font-bold block ${palette.textClass}`}>
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Xóa món này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-xs font-medium hover:underline ${palette.textClass}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('cart.continue_shopping')}</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div
          className={`p-6 rounded-3xl border backdrop-blur-md space-y-6 sticky top-28 ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-800/90 shadow-inner'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center gap-2 pb-4 border-b ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${palette.textClass}`} />
            <h3 className="font-serif text-base font-bold">{t('cart.summary')}</h3>
          </div>

          {/* Promo code form */}
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="LUXE10"
                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs uppercase focus:outline-none ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>
            <button
              type="submit"
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              {language === 'vi' ? 'Áp Dụng' : 'Apply'}
            </button>
          </form>

          {discountApplied && (
            <p className="text-[11px] text-emerald-400 font-medium">
              ✨ LUXE10 (-10% VIP Privilege)!
            </p>
          )}

          {/* Calculations */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>{t('cart.subtotal')} ({totalItems}):</span>
              <span className="font-medium text-zinc-200">{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>{t('cart.shipping')}:</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-400 font-medium">{t('cart.shipping_free')}</span>
                ) : (
                  formatCurrency(shippingFee)
                )}
              </span>
            </div>

            {discountApplied && (
              <div className="flex justify-between text-emerald-400">
                <span>VIP Discount (10%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div
              className={`pt-3 border-t flex justify-between items-baseline ${
                isDark ? 'border-zinc-800' : 'border-zinc-200'
              }`}
            >
              <span className="text-sm font-semibold">{t('cart.total')}:</span>
              <span className={`font-serif text-xl font-bold ${palette.textClass}`}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Proceed to checkout button */}
          <button
            onClick={() => navigate('/checkout')}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950`}
            style={{
              boxShadow: `0 4px 15px -3px ${palette.glow}`,
            }}
          >
            <span>{t('cart.proceed_checkout')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Guarantee */}
          <div
            className={`pt-4 border-t flex items-center gap-3 text-zinc-400 text-[11px] ${
              isDark ? 'border-zinc-800/80' : 'border-zinc-200'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${palette.textClass} shrink-0`} />
            <span>
              {language === 'vi'
                ? 'Thanh toán an toàn, bảo mật thông tin tuyệt đối.'
                : '100% Secure white-glove transaction.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
