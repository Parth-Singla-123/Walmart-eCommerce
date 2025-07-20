import { useCallback, useState } from "react";

export function useWish() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist
  const getWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist/get", { method: "GET" });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
        return data.wishlist || [];
      } else {
        setError(data.error || "Failed to fetch wishlist");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist/add", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
        return { success: true, wishlist: data.wishlist || [] };
      } else {
        setError(data.error || "Failed to add to wishlist");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError("Network error");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist/remove", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
        return { success: true, wishlist: data.wishlist || [] };
      } else {
        setError(data.error || "Failed to remove from wishlist");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError("Network error");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    wishlist,
    loading,
    error,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    setWishlist, // Exposed in case you want to update locally
  };
}
