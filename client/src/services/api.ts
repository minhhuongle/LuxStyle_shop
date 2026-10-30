import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  Category,
  Product,
  PaginatedProducts,
  Order,
  PaginatedOrders,
  AnalyticsOverview,
  ChatMessage,
  ChatResponse,
  User,
  OrderStatus
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxestyle_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        // Token has expired or is invalid
        localStorage.removeItem('luxestyle_token');
        localStorage.removeItem('luxestyle_user');
      }
    }
    return Promise.reject(error);
  }
);

// 1. Authentication APIs
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  register: async (username: string, email: string, password: string): Promise<User> => {
    const res = await api.post<User>('/auth/register', { username, email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

// 2. Categories APIs
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories/');
    return res.data;
  },
  getById: async (id: number): Promise<Category> => {
    const res = await api.get<Category>(`/categories/${id}`);
    return res.data;
  },
};

// 3. Products APIs (Client)
export interface ProductFilterParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
}

export const productsApi = {
  getAll: async (params: ProductFilterParams = {}): Promise<PaginatedProducts> => {
    const cleanParams: Record<string, any> = {};
    if (params.page) cleanParams.page = params.page;
    if (params.page_size) cleanParams.page_size = params.page_size;
    if (params.keyword && params.keyword.trim()) cleanParams.keyword = params.keyword.trim();
    if (params.category_id !== undefined && params.category_id !== null) cleanParams.category_id = params.category_id;
    if (params.min_price !== undefined && params.min_price !== null && params.min_price > 0) cleanParams.min_price = params.min_price;
    if (params.max_price !== undefined && params.max_price !== null && params.max_price > 0) cleanParams.max_price = params.max_price;

    const res = await api.get<PaginatedProducts>('/products/', { params: cleanParams });
    return res.data;
  },
  getById: async (id: number): Promise<Product> => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },
};

// 4. Orders APIs (Client)
export interface CreateOrderPayload {
  items: Array<{ product_id: number; quantity: number }>;
}

export const ordersApi = {
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await api.post<Order>('/orders/', payload);
    return res.data;
  },
  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>('/orders/my-orders');
    return res.data;
  },
  getById: async (id: number): Promise<Order> => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },
  requestReturn: async (id: number): Promise<Order> => {
    const res = await api.put<Order>(`/orders/${id}/return`);
    return res.data;
  },
};

// 5. AI Chatbot API
export const chatApi = {
  sendMessage: async (
    message: string,
    history: Array<{ role: 'user' | 'assistant' | 'model'; content: string }>
  ): Promise<ChatResponse> => {
    const payload = {
      message,
      history: history.map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : h.role,
        content: h.content,
      })),
    };
    const res = await api.post<ChatResponse>('/chat/', payload);
    return res.data;
  },
};

// 6. Admin Dashboard APIs
export interface AdminProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id?: number | null;
  image_url?: string | null;
}

export const adminApi = {
  getAnalytics: async (): Promise<AnalyticsOverview> => {
    const res = await api.get<AnalyticsOverview>('/admin/analytics/overview');
    return res.data;
  },
  getOrders: async (page = 1, pageSize = 10, status?: string): Promise<PaginatedOrders> => {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (status) params.status = status;
    const res = await api.get<PaginatedOrders>('/admin/orders', { params });
    return res.data;
  },
  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const res = await api.put<Order>(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },
  createProduct: async (payload: AdminProductPayload): Promise<Product> => {
    const res = await api.post<Product>('/admin/products', payload);
    return res.data;
  },
  updateProduct: async (id: number, payload: Partial<AdminProductPayload>): Promise<Product> => {
    const res = await api.put<Product>(`/admin/products/${id}`, payload);
    return res.data;
  },
  deleteProduct: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/admin/products/${id}`);
    return res.data;
  },
};

export default api;
