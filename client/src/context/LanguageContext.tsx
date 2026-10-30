import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Brand & Slogan
    'brand.name': 'LUXESTYLE',
    'brand.slogan': 'Haute Couture & Accessories',
    'brand.description': 'Biểu tượng của đẳng cấp thời trang thượng lưu và phụ kiện tinh xảo.',

    // Navigation & Sidebar
    'nav.menu': 'Menu & Tài khoản',
    'nav.home': 'Trang chủ',
    'nav.catalog': 'Bộ sưu tập',
    'nav.cart': 'Giỏ hàng',
    'nav.orders': 'Lịch sử đơn hàng',
    'nav.admin': 'Quản trị viên (Admin)',
    'nav.login': 'Đăng nhập',
    'nav.register': 'Đăng ký',
    'nav.logout': 'Đăng xuất',
    'nav.close': 'Đóng',
    'nav.search_placeholder': 'Tìm kiếm váy đầm, túi xách, đồng hồ...',

    // User Profile
    'user.greeting': 'Xin chào,',
    'user.vip_badge': '✨ Khách hàng VIP',
    'user.admin_badge': '🛡️ Quản trị viên',
    'user.guest': 'Khách hàng thân thiết',
    'user.login_prompt': 'Đăng nhập để nhận ưu đãi VIP & quản lý đơn hàng.',
    'user.quick_admin': 'Admin mẫu',
    'user.quick_customer': 'Khách mẫu',
    'user.account_center': 'Trung tâm tài khoản',

    // Theme & Preferences
    'theme.title': 'Tùy Chỉnh Giao Diện',
    'theme.mode': 'Chế độ hiển thị',
    'theme.dark': 'Tối (Obsidian)',
    'theme.light': 'Sáng (Ivory)',
    'theme.system': 'Hệ thống',
    'theme.color_palette': 'Gam màu thượng lưu',
    'theme.gold': 'Vàng Hoàng Gia',
    'theme.emerald': 'Lục Bảo Quý Tộc',
    'theme.sapphire': 'Sapphire Huyền Bí',
    'theme.ruby': 'Hồng Vàng & Ruby',
    'theme.amethyst': 'Thạch Anh Tím',
    'theme.language': 'Ngôn ngữ',

    // Product & Actions
    'product.buy_now': 'Mua ngay',
    'product.add_to_cart': 'Thêm giỏ',
    'product.added_to_cart': 'Đã thêm',
    'product.view_details': 'Xem chi tiết',
    'product.in_stock': 'Còn hàng',
    'product.out_of_stock': 'Hết hàng',
    'product.low_stock': 'Chỉ còn',
    'product.price': 'Giá niêm yết',
    'product.filter_all': 'Tất cả danh mục',
    'product.filter_title': 'Bộ Lọc Tinh Tuyển',
    'product.filter_price': 'Mức giá tối đa',
    'product.filter_reset': 'Đặt lại bộ lọc',
    'product.total_count': 'thiết kế cao cấp',
    'product.empty': 'Không tìm thấy sản phẩm phù hợp.',

    // Cart & Checkout
    'cart.title': 'Giỏ Hàng Thượng Lưu',
    'cart.empty_message': 'Giỏ hàng của quý khách hiện đang trống.',
    'cart.continue_shopping': 'Tiếp tục khám phá',
    'cart.summary': 'Tóm tắt đơn hàng',
    'cart.subtotal': 'Tạm tính',
    'cart.shipping': 'Phí vận chuyển',
    'cart.shipping_free': 'Miễn phí VIP',
    'cart.total': 'Tổng thanh toán',
    'cart.proceed_checkout': 'Tiến hành đặt hàng',

    // Support & Footer
    'footer.authentic_title': 'Chính Hãng 100%',
    'footer.authentic_desc': 'Cam kết chất liệu thượng hạng, tuyển chọn khắt khe theo chuẩn quốc tế.',
    'footer.shipping_title': 'Giao Hàng Hỏa Tốc',
    'footer.shipping_desc': 'Đóng gói hộp quà cao cấp, miễn phí vận chuyển đơn hàng trên 2.000.000₫.',
    'footer.returns_title': 'Đổi Hàng Linh Hoạt',
    'footer.returns_desc': 'Hỗ trợ đổi size và mẫu mã trong 7 ngày với sự phục vụ tận tâm.',
    'footer.ai_title': 'AI Stylist 24/7',
    'footer.ai_desc': 'Trợ lý trí tuệ nhân tạo luôn sẵn sàng tư vấn phối đồ và chọn quà tặng.',
    'footer.hotline': 'Hotline VIP: 1900 8888 (24/7)',
    'footer.copyright': 'Bản quyền thuộc về LuxeStyle Haute Couture. Mọi quyền được bảo lưu.',

    // AI Chatbot
    'chatbot.title': 'LuxeStyle AI Stylist',
    'chatbot.subtitle': 'Chuyên viên tư vấn phong cách & bán hàng',
    'chatbot.placeholder': 'Hỏi về phong cách, phối đồ, hoặc sản phẩm...',
  },
  en: {
    // Brand & Slogan
    'brand.name': 'LUXESTYLE',
    'brand.slogan': 'Haute Couture & Accessories',
    'brand.description': 'The epitome of high fashion excellence and exquisite luxury accessories.',

    // Navigation & Sidebar
    'nav.menu': 'Menu & Account',
    'nav.home': 'Home',
    'nav.catalog': 'Collections',
    'nav.cart': 'Shopping Cart',
    'nav.orders': 'Order History',
    'nav.admin': 'Admin Dashboard',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Sign Out',
    'nav.close': 'Close',
    'nav.search_placeholder': 'Search luxury dresses, handbags, timepieces...',

    // User Profile
    'user.greeting': 'Welcome,',
    'user.vip_badge': '✨ VIP Member',
    'user.admin_badge': '🛡️ Administrator',
    'user.guest': 'Valued Guest',
    'user.login_prompt': 'Sign in to access VIP concierge privileges & track orders.',
    'user.quick_admin': 'Demo Admin',
    'user.quick_customer': 'Demo Customer',
    'user.account_center': 'Account Center',

    // Theme & Preferences
    'theme.title': 'Design Preferences',
    'theme.mode': 'Display Mode',
    'theme.dark': 'Obsidian Dark',
    'theme.light': 'Ivory Light',
    'theme.system': 'System Default',
    'theme.color_palette': 'Luxury Accent Palette',
    'theme.gold': 'Imperial Gold',
    'theme.emerald': 'Royal Emerald',
    'theme.sapphire': 'Midnight Sapphire',
    'theme.ruby': 'Rose Gold & Ruby',
    'theme.amethyst': 'Royal Amethyst',
    'theme.language': 'Language',

    // Product & Actions
    'product.buy_now': 'Buy Now',
    'product.add_to_cart': 'Add to Cart',
    'product.added_to_cart': 'Added',
    'product.view_details': 'View Details',
    'product.in_stock': 'In Stock',
    'product.out_of_stock': 'Out of Stock',
    'product.low_stock': 'Only',
    'product.price': 'Listed Price',
    'product.filter_all': 'All Collections',
    'product.filter_title': 'Curated Filters',
    'product.filter_price': 'Max Price Range',
    'product.filter_reset': 'Reset Filters',
    'product.total_count': 'haute couture designs',
    'product.empty': 'No matching luxury pieces found.',

    // Cart & Checkout
    'cart.title': 'Your Haute Couture Cart',
    'cart.empty_message': 'Your shopping bag is currently empty.',
    'cart.continue_shopping': 'Continue Exploring',
    'cart.summary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'White-Glove Shipping',
    'cart.shipping_free': 'VIP Complimentary',
    'cart.total': 'Total Investment',
    'cart.proceed_checkout': 'Proceed to Checkout',

    // Support & Footer
    'footer.authentic_title': '100% Guaranteed Authentic',
    'footer.authentic_desc': 'Crafted with peerless materials conforming to premier global standards.',
    'footer.shipping_title': 'Express Concierge Delivery',
    'footer.shipping_desc': 'Luxury gift packaging with complimentary shipping on orders over 2.000.000₫.',
    'footer.returns_title': 'Flexible Returns',
    'footer.returns_desc': 'Effortless 7-day size and design exchange with dedicated concierge support.',
    'footer.ai_title': '24/7 AI Stylist Advisor',
    'footer.ai_desc': 'Intelligent conversational AI styling assistance for bespoke mix & match.',
    'footer.hotline': 'VIP Concierge: 1900 8888 (24/7)',
    'footer.copyright': 'Copyright © LuxeStyle Haute Couture. All rights reserved.',

    // AI Chatbot
    'chatbot.title': 'LuxeStyle AI Stylist',
    'chatbot.subtitle': 'Haute Couture Style & Sales Concierge',
    'chatbot.placeholder': 'Ask for styling advice, mix & match, or luxury gifts...',
  },
};

const LANG_KEY = 'luxestyle_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved === 'en' || saved === 'vi' ? saved : 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[language] || translations.vi;
      if (key in dict) {
        return dict[key];
      }
      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
