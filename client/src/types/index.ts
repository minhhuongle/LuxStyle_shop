export type Role = 'customer' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: number | null;
  image_url?: string | null;
  created_at?: string;
  category?: Category | null;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled' | 'return_requested' | 'returned';

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
  user?: User;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalyticsOverview {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  orders_by_status: Record<string, number>;
}

export interface ChatProductRecommendation {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  category_name?: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
  suggested_products?: ChatProductRecommendation[];
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  suggested_products: ChatProductRecommendation[];
}
