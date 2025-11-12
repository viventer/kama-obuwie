"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { flushSync } from "react-dom";
import {
  ShoppingCartItemSchema,
  ShoppingCartItemType,
} from "@/firebase/schemas/shoppingCartSchemas";
import { z } from "zod";

const SHOPPING_CART_KEY = "shopping-cart";

export function useShoppingCart() {
  const [cart, setCart] = useState<ShoppingCartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseId = useId();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(SHOPPING_CART_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate the cart data against schema
        const validatedCart = z.array(ShoppingCartItemSchema).parse(parsedCart);
        setCart(validatedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      // Clear invalid cart data
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
        // Validate the new item
        ShoppingCartItemSchema.parse(newItem);
        flushSync(() => {
          setCart((prevCart) => [...prevCart, newItem]);
        });
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
    flushSync(() => {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
      }

      flushSync(() => {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId
              ? { ...item, item: { ...item.item, quantity: newQuantity } }
              : item
          )
        );
      });
    },
    [removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.setItem(SHOPPING_CART_KEY, JSON.stringify([]));
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
      flushSync(() => {
        setCart((prevCart) => {
          const newItem: ShoppingCartItemType = {
            id: generateId(),
            item: {
              ...newItemData,
              quantity: newItemData.quantity || 1,
            },
          };

          try {
            // Validate the new item
            ShoppingCartItemSchema.parse(newItem);

            // Replace old item with new one in single operation
            return prevCart.map((item) =>
              item.id === oldItemId ? newItem : item
            );
          } catch (error) {
            console.error("Error replacing cart item:", error);
            // Return original cart if validation fails
            return prevCart;
          }
        });
      });
    },
    [generateId]
  );

  // Update availability status for cart items
  const updateItemAvailability = useCallback(
    (itemId: string, isAvailable: boolean) => {
      flushSync(() => {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId
              ? { ...item, item: { ...item.item, isAvailable } }
              : item
          )
        );
      });
    },
    []
  );

  // Check if cart has unavailable items and return their IDs
  const hasUnavailableItems = useCallback(() => {
    const unavailableItems = cart.filter((item) => !item.item.isAvailable);
    return {
      hasUnavailable: unavailableItems.length > 0,
      unavailableItemIds: unavailableItems.map((item) => item.id),
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
    replaceCartItem,
    updateItemAvailability,
    hasUnavailableItems,
  };
}
