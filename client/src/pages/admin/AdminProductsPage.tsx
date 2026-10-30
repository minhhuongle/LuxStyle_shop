import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';
import { adminApi, productsApi, categoriesApi, AdminProductPayload } from '../../services/api';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State: null = closed, 'create' | 'edit'
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<AdminProductPayload>({
    name: '',
    description: '',
    price: 1000000,
    stock: 10,
    category_id: null,
    image_url: '',
  });

  // Delete Confirm Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.getAll({ page_size: 100, keyword: searchQuery }),
        categoriesApi.getAll(),
      ]);
      setProducts(prodRes.items);
      setCategories(catRes);
    } catch (err) {
      console.error('Failed to load products/categories', err);
      showToast('Lỗi khi tải danh sách sản phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 1500000,
      stock: 20,
      category_id: categories.length > 0 ? categories[0].id : null,
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    });
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      stock: prod.stock,
      category_id: prod.category_id || (categories.length > 0 ? categories[0].id : null),
      image_url: prod.image_url || '',
    });
    setModalMode('edit');
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Tên sản phẩm không được để trống.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const created = await adminApi.createProduct(formData);
        showToast(`Đã thêm sản phẩm "${created.name}" thành công!`, 'success');
      } else if (modalMode === 'edit' && editingProduct) {
        const updated = await adminApi.updateProduct(editingProduct.id, formData);
        showToast(`Đã cập nhật sản phẩm "${updated.name}" thành công!`, 'success');
      }
      setModalMode(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to save product', err);
      showToast(err.response?.data?.detail || 'Không thể lưu sản phẩm.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProduct(productToDelete.id);
      showToast(`Đã xóa sản phẩm "${productToDelete.name}".`, 'success');
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete product', err);
      showToast(err.response?.data?.detail || 'Không thể xóa sản phẩm.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Thêm, sửa, xóa và kiểm soát số lượng tồn kho các mặt hàng thời trang & phụ kiện.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả sản phẩm..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-zinc-400">
          Tổng cộng: <span className="text-amber-400 font-semibold">{products.length}</span> sản phẩm
        </span>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4 w-14">ID</th>
                <th className="py-4 px-4">Sản Phẩm</th>
                <th className="py-4 px-4">Danh Mục</th>
                <th className="py-4 px-4">Giá Niêm Yết</th>
                <th className="py-4 px-4">Tồn Kho</th>
                <th className="py-4 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh mục kho hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Chưa có sản phẩm nào phù hợp với từ khóa.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500">#{prod.id}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            prod.image_url ||
                            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={prod.name}
                          className="w-10 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-zinc-100 truncate">{prod.name}</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{prod.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {prod.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-amber-400">
                      {formatCurrency(prod.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          prod.stock <= 0
                            ? 'text-rose-400'
                            : prod.stock <= 5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {prod.stock} chiếc
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Product */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-serif text-lg font-bold text-white">
                {modalMode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Thông Tin Sản Phẩm'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Áo Blazer Dạ Tweed Thượng Hạng"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Danh mục sản phẩm</label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Giá bán (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Số lượng trong kho (Stock) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Đường dẫn ảnh (Image URL)</label>
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chất liệu, thiết kế, xuất xứ..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo Sản Phẩm' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-rose-500/30 shadow-2xl p-6 text-center space-y-4 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Xác Nhận Xóa Sản Phẩm?</h3>
              <p className="text-xs text-zinc-400 mt-2">
                Bạn có chắc chắn muốn xóa sản phẩm{' '}
                <span className="text-white font-semibold">"{productToDelete.name}"</span> (ID: #{productToDelete.id})? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Đồng Ý Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
