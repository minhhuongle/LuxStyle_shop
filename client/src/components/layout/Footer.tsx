import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { resolvedMode, palette } = useTheme();
  const isDark = resolvedMode === 'dark';

  return (
    <footer
      className={`border-t transition-colors duration-300 mt-20 backdrop-blur-2xl ${
        isDark
          ? 'border-zinc-800/60 bg-[#07080c]/80 text-zinc-400'
          : 'border-zinc-200/80 bg-white/80 text-zinc-600'
      }`}
    >
      {/* 1. Brand Value Pillars */}
      <div
        className={`border-b py-10 ${
          isDark ? 'border-zinc-800/60' : 'border-zinc-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${palette.borderClass} ${palette.textClass} ${
                isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {t('footer.authentic_title')}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t('footer.authentic_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${palette.borderClass} ${palette.textClass} ${
                isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {t('footer.shipping_title')}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t('footer.shipping_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${palette.borderClass} ${palette.textClass} ${
                isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {t('footer.returns_title')}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t('footer.returns_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${palette.borderClass} ${palette.textClass} ${
                isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'
              }`}
            >
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {t('footer.ai_title')}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t('footer.ai_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${palette.gradientClass} flex items-center justify-center text-zinc-950 font-bold shadow-md`}
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
            </div>
            <span
              className={`font-serif text-xl font-bold tracking-wider ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              {t('brand.name')}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t('brand.description')}
          </p>
        </div>

        <div>
          <h5
            className={`font-semibold text-sm tracking-wider uppercase mb-4 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Danh Mục Nổi Bật' : 'Premier Collections'}
          </h5>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-amber-400 transition-colors">
                {language === 'vi' ? 'Áo Blazer & Trang Phục Thiết Kế' : 'Designer Blazers & Tailored Suits'}
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-amber-400 transition-colors">
                {language === 'vi' ? 'Váy & Đầm Lụa Dạ Tiệc' : 'Silk Evening Gowns & Cocktail Dresses'}
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-amber-400 transition-colors">
                {language === 'vi' ? 'Túi Xách Da Thật & Ví Cầm Tay' : 'Artisanal Leather Bags & Clutches'}
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-amber-400 transition-colors">
                {language === 'vi' ? 'Đồng Hồ Cơ Sapphire Thụy Sĩ' : 'Swiss Sapphire Timepieces'}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5
            className={`font-semibold text-sm tracking-wider uppercase mb-4 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Hỗ Trợ Khách Hàng' : 'Concierge Client Care'}
          </h5>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="hover:text-amber-400 cursor-pointer">
                {language === 'vi' ? 'Hướng dẫn chọn kích cỡ (Size Guide)' : 'Bespoke Size & Fit Guide'}
              </span>
            </li>
            <li>
              <span className="hover:text-amber-400 cursor-pointer">
                {language === 'vi' ? 'Chính sách bảo hành & Đổi trả' : 'Warranty & Care Privileges'}
              </span>
            </li>
            <li>
              <span className="hover:text-amber-400 cursor-pointer">
                {language === 'vi' ? 'Phương thức thanh toán & Vận chuyển' : 'Payment & White-Glove Logistics'}
              </span>
            </li>
            <li>
              <span className="hover:text-amber-400 cursor-pointer">
                {language === 'vi' ? 'Chính sách bảo mật thông tin' : 'Privacy & Security Protocols'}
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5
            className={`font-semibold text-sm tracking-wider uppercase ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Bản Tin Phong Cách' : 'The Style Journal'}
          </h5>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {language === 'vi'
              ? 'Đăng ký nhận thông tin độc quyền về các bộ sưu tập giới hạn và ưu đãi VIP.'
              : 'Subscribe to receive private invitations to limited editions and VIP salon previews.'}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder={language === 'vi' ? 'Nhập email của bạn...' : 'Enter your email...'}
              className={`rounded-xl px-3 py-2 text-xs flex-1 border transition-all focus:outline-none ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400'
              }`}
            />
            <button
              className={`px-4 py-2 font-bold rounded-xl text-xs transition-transform active:scale-95 bg-gradient-to-r ${palette.gradientClass} text-zinc-950 shrink-0 shadow-md`}
            >
              {language === 'vi' ? 'Đăng Ký' : 'Join'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Copyright */}
      <div
        className={`border-t py-6 text-center text-xs text-zinc-400 ${
          isDark ? 'border-zinc-900' : 'border-zinc-200'
        }`}
      >
        <p>© 2026 LUXESTYLE • Haute Couture & Luxury Fashion. All rights reserved.</p>
      </div>
    </footer>
  );
};
