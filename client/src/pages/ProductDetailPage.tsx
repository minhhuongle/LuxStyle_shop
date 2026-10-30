import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);

    productsApi
      .getById(Number(id))
      .then((data) => {
        setProduct(data);
        // Fetch related products from the same category
        if (data.category_id) {
          productsApi
            .getAll({ category_id: data.category_id, page_size: 4 })
            .then((res) => {
              setRelatedProducts(res.items.filter((p) => p.id !== data.id).slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Failed to load product detail', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400 font-serif">Đang tải kiệt tác thời trang...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-zinc-100">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-zinc-400">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, quantity);
    if (added) {
      navigate('/cart');
    }
  };

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400">
        <Link to="/" className="hover:text-amber-400 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <span className="hover:text-amber-400 transition-colors">
              {product.category.name}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-amber-400 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Large Product Image Preview */}
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl group">
          <img
            src={
              product.image_url ||
              'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80'
            }
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-60" />

          {/* Luxury Badge */}
          <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Chế Tác Tinh Tuyển</span>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-8">
          <div>
            {product.category && (
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-100 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-4 mt-4 pb-6 border-b border-zinc-800">
              <span className="font-serif text-3xl font-extrabold text-amber-400">
                {formatCurrency(product.price)}
              </span>

              {/* Stock Status */}
              <div>
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-500/30 text-rose-300">
                    Hết hàng
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    Còn {product.stock} sản phẩm trong kho
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Mô Tả Sản Phẩm
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {product.description ||
                'Chất liệu cao cấp, đường kim mũi chỉ được gia công tỉ mỉ theo tiêu chuẩn haute couture quốc tế. Mang lại phong cách sang trọng và khẳng định gu thẩm mỹ tinh tế của chủ nhân.'}
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-zinc-400">Số lượng:</span>
              <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 text-zinc-100 font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>Mua Ngay</span>
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/80">
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Bảo Hành 2 Năm</p>
              <p className="text-[10px] text-zinc-400">Cam kết chính hãng</p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center space-y-1">
              <Truck className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Giao Hỏa Tốc</p>
              <p className="text-[10px] text-zinc-400">Đóng gói chuẩn hộp quà</p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center space-y-1">
              <RotateCcw className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Đổi Trả 7 Ngày</p>
              <p className="text-[10px] text-zinc-400">Miễn phí đổi kích cỡ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">Kiệt Tác Cùng Bộ Sưu Tập</h2>
              <p className="text-xs text-zinc-400 mt-1">Các sản phẩm cùng phong cách bạn có thể yêu thích</p>
            </div>
            <Link to="/" className="text-xs text-amber-400 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
