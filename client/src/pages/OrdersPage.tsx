import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { ordersApi } from '../services/api';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

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
          setExpandedOrderId(data[0].id); // Auto-expand first order
        }
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-zinc-100">Vui lòng đăng nhập</h2>
        <p className="text-xs text-zinc-400">
          Quý khách cần đăng nhập để tra cứu lịch sử và tiến độ giao hàng của các đơn hàng đã đặt.
        </p>
        <Link
          to="/login?redirect=/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400 font-serif">Đang tra cứu lịch sử đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
          <Package className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-100">Chưa có đơn hàng nào</h2>
          <p className="text-xs text-zinc-400 mt-2">
            Quý khách chưa thực hiện đơn đặt hàng nào tại LuxeStyle. Khám phá các bộ sưu tập cao cấp ngay hôm nay!
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Bắt đầu mua sắm</span>
        </Link>
      </div>
    );
  }

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-100">Lịch Sử Đơn Hàng</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Theo dõi trạng thái và chi tiết các đơn hàng quý khách đã mua sắm tại LuxeStyle.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          return (
            <div
              key={order.id}
              className="rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all overflow-hidden"
            >
              {/* Order Header Summary Bar */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 text-amber-400 flex items-center justify-center font-bold text-xs">
                    #{order.id}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-sm font-bold text-zinc-100">
                        Đơn hàng #{order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-zinc-400 block uppercase">Tổng tiền</span>
                    <span className="font-serif text-base font-bold text-amber-400">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>

                  <button
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                    title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Order Items Breakdown (Expanded View) */}
              {isExpanded && (
                <div className="p-5 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Danh sách sản phẩm ({order.order_items.length} món)</span>
                  </h4>

                  <div className="divide-y divide-zinc-800/60">
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
                            <p className="font-semibold text-zinc-200 truncate">
                              {item.product?.name || `Sản phẩm #${item.product_id}`}
                            </p>
                            <p className="text-zinc-500">
                              Đơn giá: {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <span className="font-serif font-bold text-amber-400 shrink-0">
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
    </div>
  );
};
