import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'luxestyle_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [items]);

  const isInCart = useCallback(
    (productId: number) => {
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  const addToCart = useCallback(
    (product: Product, quantity: number = 1): boolean => {
      if (product.stock <= 0) {
        showToast(`Sản phẩm "${product.name}" hiện đang hết hàng.`, 'error');
        return false;
      }

      let success = true;
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const currentQty = prevItems[existingIndex].quantity;
          const newQty = currentQty + quantity;

          if (newQty > product.stock) {
            showToast(
              `Kho hàng chỉ còn ${product.stock} chiếc sản phẩm "${product.name}".`,
              'error'
            );
            success = false;
            return prevItems;
          }

          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
          };
          return updated;
        } else {
          if (quantity > product.stock) {
            showToast(
              `Kho hàng chỉ còn ${product.stock} chiếc sản phẩm "${product.name}".`,
              'error'
            );
            success = false;
            return prevItems;
          }

          return [...prevItems, { product, quantity }];
        }
      });

      if (success) {
        showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
      }
      return success;
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.product.id === productId) {
            if (quantity > item.product.stock) {
              showToast(
                `Chỉ còn ${item.product.stock} sản phẩm trong kho.`,
                'error'
              );
              return { ...item, quantity: item.product.stock };
            }
            return { ...item, quantity };
          }
          return item;
        });
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      setItems((prevItems) => {
        const itemToRemove = prevItems.find((i) => i.product.id === productId);
        if (itemToRemove) {
          showToast(`Đã xóa "${itemToRemove.product.name}" khỏi giỏ hàng.`, 'info');
        }
        return prevItems.filter((i) => i.product.id !== productId);
      });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
