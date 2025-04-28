import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import type { Product } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const {
    name,
    description,
    price,
    category,
    image,
    rating,
    badge,
    discountPrice,
    isService,
  } = product;

  // Render stars based on rating
  const renderStars = () => {
    const stars = [];
    const ratingNum = parseFloat(rating as string);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" />);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} />);
    }

    return stars;
  };

  // Get badge color class
  const getBadgeColorClass = () => {
    switch (badge) {
      case "NEW":
        return "bg-secondary-500";
      case "SALE":
        return "bg-red-500";
      case "BESTSELLER":
        return "bg-secondary-500";
      case "POPULAR":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-48 object-cover"
        />
        {badge && (
          <div className={`absolute top-2 right-2 ${getBadgeColorClass()} text-white text-xs font-bold px-2 py-1 rounded`}>
            {badge}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          <div className="flex text-yellow-400 text-xs items-center">
            {renderStars()}
            <span className="text-gray-600 ml-1">{rating}</span>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-1 text-gray-900">{name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-primary">
              ${price}
              {isService && <span className="text-sm font-normal">/hr</span>}
            </span>
            {discountPrice && (
              <span className="text-xs text-gray-500 line-through ml-1">${discountPrice}</span>
            )}
          </div>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary-600 text-white transition"
            onClick={handleAddToCart}
          >
            {isService ? "Book Now" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
