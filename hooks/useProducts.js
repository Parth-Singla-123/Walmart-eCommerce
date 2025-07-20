import { useState, useCallback } from "react";

// Custom hook for product management and recommendations
export function useProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [personalized, setPersonalized] = useState([]);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [personalizedError, setPersonalizedError] = useState(null);

  const [chatbotRecommended, setChatbotRecommended] = useState([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatbotError, setChatbotError] = useState(null);

  const [popular, setPopular] = useState([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState(null);

  // Fetch all products
  const getProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        return { success: true, products: data.products || [] };
      } else {
        setError(data.error || "Failed to fetch products");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError("Network error");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch personalized recommendations for a user
  const getPersonalizedProducts = useCallback(
    async (userId) => {
      setPersonalizedLoading(true);
      setPersonalizedError(null);
      try {
        let allProducts = products;
        if (!products.length) {
          const res = await fetch("/api/product");
          const data = await res.json();
          if (res.ok) {
            allProducts = data.products || [];
            setProducts(allProducts);
          } else {
            setPersonalizedError(data.error || "Failed to fetch products");
            setPersonalized([]);
            setPersonalizedLoading(false);
            return;
          }
        }
        console.log("About to fetch recommendations from Flask for user:", userId);
        const recRes = await fetch(`http://localhost:5000/recommend/${encodeURIComponent(userId)}`);
        console.log("Did fetch to Flask.");
        const recData = await recRes.json();
        console.log("Flask recommendations:", recData.recommendations);
        if (!recRes.ok || !recData.recommendations) {
          setPersonalizedError(recData.error || "Failed to fetch recommendations");
          setPersonalized([]);
          setPersonalizedLoading(false);
          return;
        }


                // Normalize names for robust matching
        const normalize = str => str.trim().toLowerCase();

        const productNamesSet = new Set(allProducts.map(p => normalize(p.name)));
        console.log("All product names in DB (normalized):", Array.from(productNamesSet));

        const validNames = recData.recommendations.filter(name =>
          productNamesSet.has(normalize(name))
        );
        console.log("Names matched in DB:", validNames);



        if (!validNames.length) {
          setPersonalized([]);
          setPersonalizedLoading(false);
          return;
        }


        const byNameRes = await fetch("/api/product/by-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names: validNames }),
        });
        const byNameData = await byNameRes.json();
        if (byNameRes.ok) {
          setPersonalized(byNameData.products || []);
        } else {
          setPersonalizedError(byNameData.error || "Failed to fetch product details");
          setPersonalized([]);
        }
      } catch (err) {
        setPersonalizedError("Network error");
        setPersonalized([]);
      } finally {
        setPersonalizedLoading(false);
      }
    },
    [products]
  );

  // Fetch chatbot recommended products by IDs
  const getChatbotRecommended = useCallback(async (ids) => {
    setChatbotLoading(true);
    setChatbotError(null);
    try {
      const res = await fetch("/api/product/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatbotRecommended(data.products || []);
        return { success: true, products: data.products || [] };
      } else {
        setChatbotError(data.error || "Failed to fetch products");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setChatbotError("Network error");
      return { success: false, error: "Network error" };
    } finally {
      setChatbotLoading(false);
    }
  }, []);

  // Fetch popular products
  const getPopularProducts = useCallback(async () => {
    setPopularLoading(true);
    setPopularError(null);
    try {
      let allProducts = products;
      if (!products.length) {
        const res = await fetch("/api/product");
        const data = await res.json();
        if (res.ok) {
          allProducts = data.products || [];
          setProducts(allProducts);
        } else {
          setPopularError(data.error || "Failed to fetch products");
          setPopular([]);
          setPopularLoading(false);
          return;
        }
      }
      // Make sure /public/popular_products.json exists!
      const popRes = await fetch("/popular_products.json");
      if (!popRes.ok) {
        setPopularError("Failed to fetch popular products list (404)");
        setPopular([]);
        setPopularLoading(false);
        return;
      }
      const popData = await popRes.json();
      if (!Array.isArray(popData)) {
        setPopularError("Popular products list is invalid");
        setPopular([]);
        setPopularLoading(false);
        return;
      }
      const productNamesSet = new Set(allProducts.map(p => p.name.toLowerCase()));
      const validNames = popData.filter(
        name => typeof name === "string" && productNamesSet.has(name.toLowerCase())
      );
      if (!validNames.length) {
        setPopular([]);
        setPopularLoading(false);
        return;
      }
      const byNameRes = await fetch("/api/product/by-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: validNames }),
      });
      const byNameData = await byNameRes.json();
      if (byNameRes.ok) {
        setPopular(byNameData.products || []);
      } else {
        setPopularError(byNameData.error || "Failed to fetch product details");
        setPopular([]);
      }
    } catch (err) {
      setPopularError("Network error");
      setPopular([]);
    } finally {
      setPopularLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    getProducts,
    setProducts,

    personalized,
    personalizedLoading,
    personalizedError,
    getPersonalizedProducts,
    setPersonalized,

    chatbotRecommended,
    chatbotLoading,
    chatbotError,
    getChatbotRecommended,
    setChatbotRecommended,

    popular,
    popularLoading,
    popularError,
    getPopularProducts,
    setPopular,
  };
}
