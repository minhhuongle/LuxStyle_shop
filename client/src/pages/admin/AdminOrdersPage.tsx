import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Clock,
  Eye,
  Calendar,
  X,
  PackageCheck,
  Check
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate, ORDER_STATUS_MAP } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders(page, 15, selectedStatus || undefined);
      setOrders(res.items);
      setTotalPages(res.total_pages);
      setTotalOrders(res.total);
    } catch (err) {
      console.error('Failed to load admin orders', err);
      showToast('Lỗi khi tải danh sách đơn hàng.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle inline status change
  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      showToast(
        `Đã cập nhật trạng thái đơn #${orderId} sang "${ORDER_STATUS_MAP[newStatus].label}".`,
        'success'
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      console.error('Failed to update status', err);
      showToast(err.response?.data?.detail || 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang xử lý', value: 'pending' },
    { label: 'Đang giao', value: 'shipping' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Theo dõi tiến độ, kiểm tra chi tiết giỏ hàng và cập nhật trạng thái giao hàng tức thì.
        </p>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === tab.value
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-400">
          Tổng số: <span className="text-amber-400 font-semibold">{totalOrders}</span> đơn hàng
        </span>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4 w-16">Mã ĐH</th>
                <th className="py-4 px-4">Khách Hàng</th>
                <th className="py-4 px-4">Thời Gian Đặt</th>
                <th className="py-4 px-4">Sản Phẩm</th>
                <th className="py-4 px-4">Tổng Tiền</th>
                <th className="py-4 px-4">Trạng Thái (Đổi Trực Tiếp)</th>
                <th className="py-4 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách đơn hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Không có đơn hàng nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      #{order.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-200 truncate">
                          User ID #{order.user_id}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-zinc-300">
                        {order.order_items.length} mặt hàng
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-amber-400">
                      {formatCurrency(order.total_price)}
                    </td>

                    <td className="py-3.5 px-4">
                      {/* Direct Inline Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold border focus:outline-none transition-colors ${
                          order.status === 'completed'
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : order.status === 'shipping'
                            ? 'bg-sky-950/80 border-sky-500/40 text-sky-300'
                            : order.status === 'cancelled'
                            ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                            : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <option value="pending" className="bg-zinc-900 text-zinc-100">
                          ⏳ Đang xử lý
                        </option>
                        <option value="shipping" className="bg-zinc-900 text-zinc-100">
                          🚚 Đang giao hàng
                        </option>
                        <option value="completed" className="bg-zinc-900 text-zinc-100">
                          ✅ Đã hoàn thành
                        </option>
                        <option value="cancelled" className="bg-zinc-900 text-zinc-100">
                          ❌ Đã hủy đơn
                        </option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  #{selectedOrder.id}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Chi Tiết Đơn Hàng #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Đặt lúc: {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector in Modal */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Trạng thái hiện tại:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                }
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-none"
              >
                <option value="pending">⏳ Đang xử lý</option>
                <option value="shipping">🚚 Đang giao hàng</option>
                <option value="completed">✅ Đã hoàn thành</option>
                <option value="cancelled">❌ Đã hủy đơn</option>
              </select>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Các sản phẩm trong đơn ({selectedOrder.order_items.length} món)
              </h4>

              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-zinc-950/60 overflow-hidden">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product?.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-14 rounded-lg object-cover bg-zinc-950 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-zinc-200">
                          {item.product?.name || `Mã SP: ${item.product_id}`}
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

            {/* Total */}
            <div className="flex justify-between items-baseline pt-4 border-t border-zinc-800">
              <span className="text-sm font-semibold text-zinc-300">Tổng thanh toán:</span>
              <span className="font-serif text-2xl font-bold text-amber-400">
                {formatCurrency(selectedOrder.total_price)}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
