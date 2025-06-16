import { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '€'
  const deliveryFee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Храним локальное состояние корзины
  const [cartItems, setCartItems] = useState({});

  // Get token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Load products list
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      console.log("Products loaded:", data.products);
      return data.products;
    },
  });

  // Load user cart if token exists
  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/cart/get`, {
        headers: { token },
      });
      return data?.cartData || {};
    },
    enabled: !!token,
    onError: () => {
      toast.error("Failed to load cart.");
    },
  });

  // Refetch cart after login/logout
  useEffect(() => {
    if (token) {
      refetch().then((res) => {
        setCartItems(res.data || {});
      });
    }
  }, [token, refetch]);

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ itemId, size, color }) => {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size, color },
        { headers: { token } }
      );
    },
    onMutate: ({ itemId, size, color }) => {
      if (!size) {
        toast.error("Select Product Size");
        return;
      }

      const updatedCart = structuredClone(cartItems);
      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      
      // Create a unique key combining size and color
      const cartKey = color ? `${size}-${color}` : size;
      updatedCart[itemId][cartKey] = (updatedCart[itemId][cartKey] || 0) + 1;
      setCartItems(updatedCart);
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  const addToCart = (itemId, size, color) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }
    addToCartMutation.mutate({ itemId, size, color });
  };

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, size, quantity, color }) => {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity, color },
        { headers: { token } }
      );
    },
    onMutate: ({ itemId, size, quantity, color }) => {
      const updatedCart = structuredClone(cartItems);

      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      const cartKey = color ? `${size}-${color}` : size;
      updatedCart[itemId][cartKey] = quantity;

      if (quantity === 0) {
        delete updatedCart[itemId][cartKey];
        if (Object.keys(updatedCart[itemId]).length === 0) {
          delete updatedCart[itemId];
        }
      }

      setCartItems(updatedCart);
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  const updateQuantity = (productId, cartKey, quantity, newCartItems = null) => {
    setCartItems(prev => {
      if (newCartItems) {
        return newCartItems
      }
      const updated = {
        ...prev,
        [productId]: {
          ...prev[productId],
          [cartKey]: quantity
        }
      }
      
      if (quantity === 0) {
        delete updated[productId][cartKey];
        if (Object.keys(updated[productId]).length === 0) {
          delete updated[productId];
        }
      }
      
      return updated;
    })
  }

  // Reset cart (e.g., after purchase)
  const resetCart = () => {
    setCartItems({});
    queryClient.removeQueries(["cart"]); // очистка кэша cart
  };

  // Get total item count in cart
  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, cartKeys) =>
        total + Object.values(cartKeys).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  // Get total price of items in cart
  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((totalAmount, [itemId, cartKeys]) => {
      const itemInfo = products.find((product) => product._id === itemId);
      if (!itemInfo) return totalAmount;
      return (
        totalAmount +
        Object.values(cartKeys).reduce(
          (sum, qty) => sum + itemInfo.price * qty,
          0
        )
      );
    }, 0);
  };

  const value = {
    products,
    isLoading: isProductsLoading || isCartLoading,
    currency,
    deliveryFee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    resetCart,
    navigate,
    backendUrl,
    token,
    setToken,
    refetch,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
