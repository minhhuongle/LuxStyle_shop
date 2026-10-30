import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Check, Zap } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();
  const { resolvedMode, palette } = useTheme();
  const navigate = useNavigate();

  const inCart = isInCart(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isDark = resolvedMode === 'dark';

  // Nút 1: Thêm vào giỏ hàng (ở lại trang hiện tại)
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  // Nút 2: MUA NGAY -> Thêm vào giỏ & nhảy trực tiếp vào giỏ hàng
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      const added = addToCart(product, 1);
      if (added) {
        navigate('/cart');
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl flex-1 backdrop-blur-md ${
        isDark
          ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-amber-500/40 hover:shadow-amber-500/10'
          : 'bg-white/85 border-zinc-200/90 hover:border-amber-400/50 shadow-sm hover:shadow-md'
      }`}
      style={{
        boxShadow: `0 4px 20px -2px rgba(0,0,0,0.15)`,
      }}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        <img
          src={
            product.image_url ||
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Pill Tag */}
        {product.category && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase backdrop-blur-md border ${
              isDark
                ? 'bg-zinc-900/80 text-zinc-200 border-zinc-700/60'
                : 'bg-white/85 text-zinc-800 border-zinc-200'
            }`}
          >
            {product.category.name}
          </span>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-500/30">
              {t('product.out_of_stock')}
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 animate-pulse">
              {t('product.low_stock')} {product.stock}
            </span>
          ) : null}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl group-hover:scale-105 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('product.view_details')}</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3
            className={`font-serif text-base font-semibold transition-colors line-clamp-1 leading-snug ${
              isDark ? 'text-zinc-100 group-hover:text-white' : 'text-zinc-900 group-hover:text-black'
            }`}
          >
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Sản phẩm thời trang cao cấp chế tác thủ công tinh tế.'}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-zinc-800/40 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider">
              {t('product.price')}
            </span>
            <span className={`font-serif text-lg font-bold ${palette.textClass}`}>
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* TWO ACTION BUTTONS: [Thêm giỏ] và [MUA NGAY] */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-800/40 text-zinc-500 text-xs font-semibold cursor-not-allowed text-center"
            >
              {t('product.out_of_stock')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Nút 1: Thêm vào giỏ */}
              <button
                onClick={handleQuickAdd}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
                  inCart
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : isDark
                    ? 'bg-zinc-800/80 border-zinc-700/80 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200 hover:text-black'
                }`}
                title={t('product.add_to_cart')}
              >
                {inCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('product.added_to_cart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('product.add_to_cart')}</span>
                  </>
                )}
              </button>

              {/* Nút 2: MUA NGAY (Nhảy trực tiếp vào giỏ hàng) */}
              <button
                onClick={handleBuyNow}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 hover:brightness-105`}
                style={{
                  boxShadow: `0 2px 10px -1px ${palette.glow}`,
                }}
                title="Mua ngay và mở giỏ hàng"
              >
                <Zap className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
                <span>{t('product.buy_now')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
