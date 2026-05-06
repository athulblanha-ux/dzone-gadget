import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Auth Store ────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'd-store-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Cart Store ────────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product, quantity = 1, variant = null) => {
        const items = get().items;
        const key = `${product._id}-${variant?.value || 'default'}`;
        const existing = items.find((i) => i.key === key);

        let newItems;
        if (existing) {
          newItems = items.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i
          );
        } else {
          newItems = [
            ...items,
            {
              key,
              product,
              quantity,
              variant,
              price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
            },
          ];
        }

        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        set({ items: newItems, total, itemCount });
      },

      removeItem: (key) => {
        const newItems = get().items.filter((i) => i.key !== key);
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        set({ items: newItems, total, itemCount });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        const newItems = get().items.map((i) => (i.key === key ? { ...i, quantity } : i));
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        set({ items: newItems, total, itemCount });
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    { name: 'd-store-cart' }
  )
);

// ─── Theme Store ────────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        set({ theme: newTheme });
      },
      initTheme: () => {
        const theme = get().theme;
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    { name: 'd-store-theme' }
  )
);

// ─── Wishlist Store ─────────────────────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const items = get().items;
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    { name: 'd-store-wishlist' }
  )
);
