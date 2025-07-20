import { useCallback, useState } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart
  const getCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/get", { method: "GET" });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart || []);
      } else {
        setError(data.error || "Failed to fetch cart");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to cart
  const addToCart = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      // Use POST if your backend expects POST for adding to cart
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart || []);
        return { success: true, cart: data.cart || [] };
      } else {
        setError(data.error || "Failed to add to cart");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError("Network error");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart || []);
      } else {
        setError(data.error || "Failed to remove from cart");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Increase quantity
  const increaseQuantity = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/increase", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart || []);
      } else {
        setError(data.error || "Failed to increase quantity");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Decrease quantity
  const decreaseQuantity = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/decrease", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart || []);
      } else {
        setError(data.error || "Failed to decrease quantity");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cart,
    loading,
    error,
    getCart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    setCart,
  };
}
