"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useId,
} from "react";
import {
  ShoppingCartItemSchema,
  ShoppingCartItemType,
} from "@/firebase/schemas/shoppingCartSchemas";
import { z } from "zod";

const SHOPPING_CART_KEY = "shopping-cart";

interface ShoppingCartContextType {
  cart: ShoppingCartItemType[];
  isLoading: boolean;
  addToCart: (
    itemData: Omit<ShoppingCartItemType["item"], "quantity"> & {
      quantity?: number;
    }
  ) => string;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getItem: (itemId: string) => ShoppingCartItemType | undefined;
  findExistingItem: (
    offerId: string,
    productId: string,
    size: string
  ) => ShoppingCartItemType | undefined;
  getCartStats: () => {
    itemCount: number;
    totalItems: number;
    totalPrice: number;
  };
  replaceCartItem: (
    oldItemId: string,
    newItemData: Omit<ShoppingCartItemType["item"], "quantity"> & {
      quantity?: number;
    }
  ) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(
  undefined
);

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error(
      "useShoppingCart must be used within a ShoppingCartProvider"
    );
  }
  return context;
}

export function ShoppingCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<ShoppingCartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseId = useId();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(SHOPPING_CART_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const validatedCart = z.array(ShoppingCartItemSchema).parse(parsedCart);
        setCart(validatedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem(SHOPPING_CART_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SHOPPING_CART_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isLoading]);

  // Generate unique ID for cart items
  const generateId = useCallback(() => {
    return `${baseId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;
  }, [baseId]);

  // Add item to cart
  const addToCart = useCallback(
    (
      itemData: Omit<ShoppingCartItemType["item"], "quantity"> & {
        quantity?: number;
      }
    ) => {
      const newItem: ShoppingCartItemType = {
        id: generateId(),
        item: {
          ...itemData,
          quantity: itemData.quantity || 1,
        },
      };

      try {
        ShoppingCartItemSchema.parse(newItem);
        setCart((prevCart) => [...prevCart, newItem]);
        return newItem.id;
      } catch (error) {
        console.error("Error adding item to cart:", error);
        throw new Error("Invalid item data");
      }
    },
    [generateId]
  );

  // Remove item from cart by ID
  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId
            ? { ...item, item: { ...item.item, quantity: newQuantity } }
            : item
        )
      );
    },
    [removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Get item by ID
  const getItem = useCallback(
    (itemId: string) => {
      return cart.find((item) => item.id === itemId);
    },
    [cart]
  );

  // Check if item exists in cart (by offerId, productId, and size)
  const findExistingItem = useCallback(
    (offerId: string, productId: string, size: string) => {
      return cart.find(
        (item) =>
          item.item.offerId === offerId &&
          item.item.productId === productId &&
          item.item.size === size
      );
    },
    [cart]
  );

  // Get cart statistics
  const getCartStats = useCallback(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.item.price * item.item.quantity,
      0
    );

    return {
      itemCount: cart.length,
      totalItems,
      totalPrice,
    };
  }, [cart]);

  // Replace cart item atomically (for editing existing items)
  const replaceCartItem = useCallback(
    (
      oldItemId: string,
      newItemData: Omit<ShoppingCartItemType["item"], "quantity"> & {
        quantity?: number;
      }
    ) => {
      const newItem: ShoppingCartItemType = {
        id: generateId(),
        item: {
          ...newItemData,
          quantity: newItemData.quantity || 1,
        },
      };

      try {
        ShoppingCartItemSchema.parse(newItem);
        setCart((prevCart) =>
          prevCart.map((item) => (item.id === oldItemId ? newItem : item))
        );
      } catch (error) {
        console.error("Error replacing cart item:", error);
      }
    },
    [generateId]
  );

  const contextValue: ShoppingCartContextType = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItem,
    findExistingItem,
    getCartStats,
    replaceCartItem,
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
}
