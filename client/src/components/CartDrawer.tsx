import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [, setLocation] = useLocation();

  // Format price to display 2 decimal places
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toFixed(2);
  };
  
  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            {cart.items.length === 0 
              ? "Your cart is empty." 
              : `You have ${cart.items.length} item${cart.items.length !== 1 ? 's' : ''} in your cart.`}
          </SheetDescription>
        </SheetHeader>

        {cart.items.length > 0 && (
          <>
            <ul className="space-y-4 my-6">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-start py-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3 className="line-clamp-1">{item.name}</h3>
                      <p className="ml-4">${formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <FaPlus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="mt-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${formatPrice(cart.total)}</p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary-600"
                  onClick={handleCheckout}
                >
                  <FaShoppingCart className="mr-2" /> Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}

        {cart.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</p>
            <p className="mt-1 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
            <Button 
              className="mt-6" 
              onClick={onClose}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}