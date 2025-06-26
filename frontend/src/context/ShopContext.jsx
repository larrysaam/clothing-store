import { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import cartAddSound from '@/assets/cart-add-sound.wav'; // Import your sound file

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

  // Create an Audio object for the notification sound
  const notificationSound = new Audio(cartAddSound);

  // Храним локальное состояние корзины
  const [cartItems, setCartItems] = useState({});
  // Храним локальное состояние корзины предзаказов
  const [preorderCartItems, setPreorderCartItems] = useState({});

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

  // Load user preorder cart if token exists
  const {
    data: preorderCartData,
    isLoading: isPreorderCartLoading,
    refetch: refetchPreorderCart,
  } = useQuery({
    queryKey: ["preorderCart"],
    queryFn: async () => {
      const { data } = await axios.post(`${backendUrl}/api/preorder/cart/get`, {}, {
        headers: { token },
      });
      return data?.cartData || {};
    },
    enabled: !!token,
    onSuccess: (data) => {
      setPreorderCartItems(data || {});
    },
    onError: () => {
      toast.error("Failed to load preorder cart.");
    },
  });

  // Refetch cart after login/logout
  useEffect(() => {
    if (token) {
      refetch().then((res) => {
        setCartItems(res.data || {});
      });
      refetchPreorderCart().then((res) => {
        setPreorderCartItems(res.data || {});
      });
    } else {
      setCartItems({});
      setPreorderCartItems({});
    }
  }, [token]); // Remove refetch dependencies to prevent automatic refetching

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
    onSuccess: (data, variables) => {
      // Find product name for the toast message
      const product = products.find(p => p._id === variables.itemId);
      const productName = product ? product.name : 'Item';
      const colorName = variables.color ? products.find(p=>p._id === variables.itemId)?.colors.find(c=>c.colorHex === variables.color)?.colorName : '';
      const sizeName = variables.size;

      toast.success(`${productName} ${colorName ? `(${colorName}, ${sizeName})` : `(${sizeName})`} added to cart!`);
      notificationSound.play().catch(error => console.error("Error playing sound:", error)); // Play sound
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to add item to cart."),
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

  // Add item to preorder cart
  const addToPreorderCartMutation = useMutation({
    mutationFn: async ({ itemId, size, color }) => {
      await axios.post(
        `${backendUrl}/api/preorder/cart/add`,
        { itemId, size, color },
        { headers: { token } }
      );
    },
    onMutate: ({ itemId, size, color }) => {
      if (!size) {
        toast.error("Select Product Size");
        return;
      }

      const updatedCart = structuredClone(preorderCartItems);
      if (!updatedCart[itemId]) updatedCart[itemId] = {};

      // Create a unique key combining size and color
      const cartKey = color ? `${size}-${color}` : size;
      updatedCart[itemId][cartKey] = (updatedCart[itemId][cartKey] || 0) + 1;
      setPreorderCartItems(updatedCart);
    },
    onSuccess: () => {
      toast.success("Item added to preorder cart!");
      // Play notification sound
      notificationSound.play().catch(e => console.log('Sound play failed:', e));
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to add item to preorder cart."),
    onSettled: () => {
      queryClient.invalidateQueries(["preorderCart"]);
    },
  });

  const addToPreorderCart = (itemId, size, color) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }
    addToPreorderCartMutation.mutate({ itemId, size, color });
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

  // Update preorder cart item quantity
  const updatePreorderQuantityMutation = useMutation({
    mutationFn: async ({ itemId, size, quantity, color }) => {
      const response = await axios.post(
        `${backendUrl}/api/preorder/cart/update`,
        { itemId, size, quantity, color },
        { headers: { token } }
      );

      // Ensure the response indicates success
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update preorder cart');
      }

      return response.data;
    },
    onMutate: ({ itemId, size, quantity, color }) => {
      const updatedCart = structuredClone(preorderCartItems);

      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      // color here is actually colorHex from the cartKey
      const cartKey = color ? `${size}-${color}` : size;

      if (quantity === 0) {
        delete updatedCart[itemId][cartKey];
        if (Object.keys(updatedCart[itemId]).length === 0) {
          delete updatedCart[itemId];
        }
      } else {
        updatedCart[itemId][cartKey] = quantity;
      }

      setPreorderCartItems(updatedCart);

      // Return context for potential rollback
      return { previousCart: preorderCartItems };
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousCart) {
        setPreorderCartItems(context.previousCart);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      // Force refetch to ensure we have the latest data
      refetchPreorderCart();
    },
  });

  const updateQuantity = (productId, cartKey, quantity, newCartItems = null) => {
    if (newCartItems) {
      setCartItems(newCartItems);
      return;
    }

    // Extract size and color from cartKey
    const [size, color] = cartKey.includes('-') ? cartKey.split('-') : [cartKey, undefined];
    updateQuantityMutation.mutate({ itemId: productId, size, quantity, color });
  }

  const updatePreorderQuantity = (productId, cartKey, quantity, newCartItems = null) => {
    if (newCartItems) {
      setPreorderCartItems(newCartItems);
      return;
    }

    // Extract size and color from cartKey
    // cartKey format: "size" or "size-colorHex"
    const [size, colorHex] = cartKey.includes('-') ? cartKey.split('-') : [cartKey, undefined];

    // Pass colorHex as color to maintain consistency with backend
    updatePreorderQuantityMutation.mutate({ itemId: productId, size, quantity, color: colorHex });
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

  // Preorder cart utility functions
  const getPreorderCartCount = () => {
    return Object.values(preorderCartItems).reduce(
      (total, cartKeys) =>
        total + Object.values(cartKeys).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  const getPreorderCartAmount = () => {
    return Object.entries(preorderCartItems).reduce((totalAmount, [itemId, cartKeys]) => {
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

  const resetPreorderCart = () => {
    setPreorderCartItems({});
    queryClient.removeQueries(["preorderCart"]);
  };

  const value = {
    products,
    isLoading: isProductsLoading || isCartLoading || isPreorderCartLoading,
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
    // Preorder cart functions
    preorderCartItems,
    setPreorderCartItems,
    addToPreorderCart,
    getPreorderCartCount,
    updatePreorderQuantity,
    getPreorderCartAmount,
    resetPreorderCart,
    refetchPreorderCart,
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
