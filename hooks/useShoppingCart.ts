"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { shoppingCartItemSchema } from "@/firebase/schemas/shoppingCartSchemas";
import { z } from "zod";

type ShoppingCartItem = z.infer<typeof shoppingCartItemSchema>;

const BASKET_KEY = "basket";

export function useShoppingCart() {
  const [cart, setCart] = useState<ShoppingCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseId = useId();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(BASKET_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate the cart data against schema
        const validatedCart = z.array(shoppingCartItemSchema).parse(parsedCart);
        setCart(validatedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      // Clear invalid cart data
      localStorage.removeItem(BASKET_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(BASKET_KEY, JSON.stringify(cart));
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
      itemData: Omit<ShoppingCartItem["item"], "quantity"> & {
        quantity?: number;
      }
    ) => {
      const newItem: ShoppingCartItem = {
        id: generateId(),
        item: {
          ...itemData,
          quantity: itemData.quantity || 1,
        },
      };

      try {
        // Validate the new item
        shoppingCartItemSchema.parse(newItem);
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

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItem,
    findExistingItem,
    getCartStats,
  };
}
