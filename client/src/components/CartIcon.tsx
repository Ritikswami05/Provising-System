import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CartDrawer from "./CartDrawer";

export default function CartIcon() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative text-gray-600 hover:text-primary"
        onClick={handleCartClick}
      >
        <FaShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.2rem] h-5 flex items-center justify-center rounded-full px-1">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>
      
      <CartDrawer 
        open={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}