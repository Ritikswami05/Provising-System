import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Cart, CartItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateSupplier: (itemId: number, supplierId: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const defaultCart: Cart = {
  items: [],
  total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const { toast } = useToast();

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Calculate total number of items in cart
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.items.findIndex(
        item => item.productId === product.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: Date.now(), // unique ID for cart item
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image,
          isService: Boolean(product.isService)
        };
        newItems = [...prevCart.items, newItem];
      }

      // Calculate the new total
      const total = calculateTotal(newItems);

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });

      return {
        items: newItems,
        total
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== itemId);
      const total = calculateTotal(newItems);

      return {
        items: newItems,
        total
      };
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    setCart(prevCart => {
      const newItems = prevCart.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      const total = calculateTotal(newItems);

      return {
        items: newItems,
        total
      };
    });
  };

  // Update item supplier
  const updateSupplier = (itemId: number, supplierId: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => 
        item.id === itemId ? { ...item, selectedSupplierId: supplierId } : item
      );
      
      // No need to recalculate total as supplier change doesn't affect product price
      return {
        ...prevCart,
        items: newItems
      };
    });
  };

  // Clear all items from cart
  const clearCart = () => {
    setCart(defaultCart);
  };

  // Helper function to calculate total price
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'string' 
        ? parseFloat(item.price) 
        : Number(item.price);
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSupplier,
        clearCart,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}