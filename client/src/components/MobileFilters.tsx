import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaTimes, FaStar } from "react-icons/fa";
import { ProductCategory } from "@shared/schema";

interface MobileFiltersProps {
  categories: readonly string[];
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  onPriceFilterChange: (min?: number, max?: number) => void;
  onRatingFilterChange: (rating?: number) => void;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

export default function MobileFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  onPriceFilterChange,
  onRatingFilterChange,
  minPrice,
  maxPrice,
  minRating,
  onClose,
  onApply,
  onReset,
}: MobileFiltersProps) {
  const [localCategory, setLocalCategory] = useState<ProductCategory>(selectedCategory);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || "");
  const [localRating, setLocalRating] = useState<string>(minRating?.toString() || "0");

  useEffect(() => {
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleApply = () => {
    onCategoryChange(localCategory);
    
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    onPriceFilterChange(min, max);
    
    const rating = localRating !== "0" ? parseInt(localRating) : undefined;
    onRatingFilterChange(rating);
    
    onApply();
  };

  const handleReset = () => {
    setLocalCategory("all");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalRating("0");
    onReset();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <FaTimes className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Categories</h3>
            <RadioGroup 
              value={localCategory} 
              onValueChange={(value) => setLocalCategory(value as ProductCategory)}
            >
              {categories.map((category) => (
                <div className="flex items-center space-x-2" key={category}>
                  <RadioGroupItem value={category} id={`mobile-${category}`} />
                  <Label htmlFor={`mobile-${category}`}>
                    {category === "all" 
                      ? "All Products" 
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Price Range</h3>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="mobile-min-price" className="block text-sm text-gray-600">Min</Label>
                <Input 
                  type="number" 
                  id="mobile-min-price" 
                  min="0" 
                  placeholder="0" 
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="mobile-max-price" className="block text-sm text-gray-600">Max</Label>
                <Input 
                  type="number" 
                  id="mobile-max-price" 
                  min="0" 
                  placeholder="1000" 
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Rating</h3>
            <RadioGroup 
              value={localRating} 
              onValueChange={setLocalRating}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="mobile-rating-any" />
                <Label htmlFor="mobile-rating-any">Any Rating</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="mobile-rating-4" />
                <Label htmlFor="mobile-rating-4" className="flex items-center">
                  <div className="flex text-yellow-400 text-sm">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-gray-300" />
                  </div>
                  <span className="ml-1">& Up</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="mobile-rating-3" />
                <Label htmlFor="mobile-rating-3" className="flex items-center">
                  <div className="flex text-yellow-400 text-sm">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                  </div>
                  <span className="ml-1">& Up</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-600"
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
