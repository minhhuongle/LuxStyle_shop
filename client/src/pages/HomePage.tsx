import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageOpen
} from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get('keyword') || '';

  const { t, language } = useLanguage();
  const { resolvedMode, palette } = useTheme();
  const isDark = resolvedMode === 'dark';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({
        page,
        page_size: 8,
        keyword: keywordFromUrl,
        category_id: selectedCategory ?? undefined,
        max_price: maxPrice < 5000000 ? maxPrice : undefined,
      });
      setProducts(data.items);
      setTotalPages(data.total_pages);
      setTotalProducts(data.total);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [page, keywordFromUrl, selectedCategory, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setMaxPrice(5000000);
    setPage(1);
    if (keywordFromUrl) {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Hero Banner Section */}
      <section
        className={`relative rounded-3xl overflow-hidden border p-8 sm:p-14 shadow-2xl transition-all duration-300 luxury-shimmer-sweep ${
          isDark
            ? 'bg-gradient-to-br from-zinc-950/90 via-[#10121a]/85 to-[#0a0b10]/90 border-amber-500/25 backdrop-blur-2xl'
            : 'bg-gradient-to-br from-white/95 via-amber-50/20 to-zinc-100/90 border-amber-400/30 backdrop-blur-xl'
        }`}
        style={{
          boxShadow: `0 20px 60px -15px ${palette.glow}`,
        }}
      >
        {/* Luminous Ambient Glows inside Hero */}
        <div
          className="absolute -top-12 -right-12 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 animate-gold-pulse"
          style={{
            background: `radial-gradient(circle, ${palette.primary} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle, ${palette.secondary} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-5">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md ${palette.borderClass} ${palette.textClass} ${
              isDark ? 'bg-zinc-900/60' : 'bg-white/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'vi'
                ? 'Bộ Sưu Tập Thu - Đông 2026'
                : 'Autumn - Winter Haute Couture 2026'}
            </span>
          </div>

          <h1
            className={`font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {language === 'vi' ? (
              <>
                Nghệ Thuật Thời Trang <br />
                <span
                  className={`bg-gradient-to-r ${palette.gradientClass} bg-clip-text text-transparent`}
                >
                  Đẳng Cấp Thượng Lưu
                </span>
              </>
            ) : (
              <>
                Artisanal Elegance <br />
                <span
                  className={`bg-gradient-to-r ${palette.gradientClass} bg-clip-text text-transparent`}
                >
                  Haute Couture Luxury
                </span>
              </>
            )}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            {language === 'vi'
              ? 'Tuyển tập các thiết kế cao cấp từ vải dạ tweed dệt tay, lụa tơ tằm tự nhiên đến da bò Epsom nhập khẩu Ý. Trải nghiệm mua sắm xa xỉ cùng sự tư vấn thông minh của AI Stylist.'
              : 'Masterpiece collections from handwoven tweed and pure silk to imported Italian Epsom leather. Indulge in premier luxury assisted by our conversational 24/7 AI Stylist.'}
          </p>

          {keywordFromUrl && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-zinc-400">
                {language === 'vi' ? 'Kết quả tìm kiếm cho:' : 'Search results for:'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${palette.borderClass} ${palette.textClass} ${
                  isDark ? 'bg-zinc-900/80' : 'bg-white'
                }`}
              >
                "{keywordFromUrl}"
              </span>
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-zinc-400 hover:text-rose-400 underline transition-colors"
              >
                {language === 'vi' ? 'Xóa tìm kiếm' : 'Clear search'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Main Content: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div
          className={`lg:hidden flex items-center justify-between pb-2 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                : 'bg-white border-zinc-200 text-zinc-800'
            }`}
          >
            <Filter className={`w-4 h-4 ${palette.textClass}`} />
            <span>{t('product.filter_title')}</span>
          </button>
          <span className="text-xs text-zinc-400">
            {totalProducts} {t('product.total_count')}
          </span>
        </div>

        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`space-y-6 lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } p-6 rounded-3xl border backdrop-blur-md sticky top-28 transition-all ${
            isDark
              ? 'bg-zinc-900/60 border-zinc-800/80 shadow-inner'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-serif font-bold">
              <SlidersHorizontal className={`w-4 h-4 ${palette.textClass}`} />
              <span>{t('product.filter_title')}</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              title={t('product.filter_reset')}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('product.filter_reset')}</span>
            </button>
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {language === 'vi' ? 'Danh Mục Sản Phẩm' : 'Product Categories'}
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  selectedCategory === null
                    ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 font-bold shadow-md`
                    : isDark
                    ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <span>{t('product.filter_all')}</span>
                {selectedCategory === null && <span>✓</span>}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 font-bold shadow-md`
                      : isDark
                      ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Slider */}
          <div
            className={`space-y-3 pt-4 border-t ${
              isDark ? 'border-zinc-800/80' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {t('product.filter_price')}
              </h4>
              <span className={`text-xs font-bold ${palette.textClass}`}>
                {maxPrice >= 5000000 ? (language === 'vi' ? 'Tất cả' : 'All') : `${(maxPrice / 1000000).toFixed(1)} tr ₫`}
              </span>
            </div>

            <input
              type="range"
              min="500000"
              max="5000000"
              step="250000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: palette.primary,
                backgroundColor: isDark ? '#27272a' : '#e5e7eb',
              }}
            />

            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>500k ₫</span>
              <span>2.5tr ₫</span>
              <span>5tr+ ₫</span>
            </div>
          </div>
        </aside>

        {/* Products Grid & Results Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {language === 'vi' ? 'Hiển thị' : 'Displaying'}{' '}
              <span className={`font-semibold ${palette.textClass}`}>{products.length}</span>{' '}
              {language === 'vi' ? 'trên' : 'of'}{' '}
              <span className="font-semibold">{totalProducts}</span> {t('product.total_count')}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden animate-pulse ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800/80'
                      : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className={`aspect-[4/5] ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-200'}`} />
                  <div className="p-4 space-y-3">
                    <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                    <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-zinc-800/60' : 'bg-zinc-200'}`} />
                    <div className={`h-5 rounded w-1/3 pt-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div
              className={`py-20 text-center rounded-3xl border space-y-4 ${
                isDark
                  ? 'bg-zinc-900/40 border-zinc-800/80'
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                  isDark ? 'bg-zinc-800/60 text-zinc-500' : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold">
                {t('product.empty')}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {language === 'vi'
                  ? 'Hãy thử nới lỏng bộ lọc danh mục hoặc khoảng giá để khám phá thêm nhiều kiệt tác thời trang.'
                  : 'Try adjusting your category or price filters to discover more haute couture pieces.'}
              </p>
              <button
                onClick={handleResetFilters}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shadow-md`}
              >
                {language === 'vi' ? 'Xem tất cả sản phẩm' : 'Browse All Pieces'}
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`p-2.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300'
                }`}
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-10 h-10 rounded-xl text-xs font-semibold transition-all ${
                      page === pageNumber
                        ? `bg-gradient-to-r ${palette.gradientClass} text-zinc-950 font-bold shadow-md`
                        : isDark
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`p-2.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300'
                }`}
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
