import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FaStar } from "react-icons/fa";
import { ProductCategory } from "@shared/schema";

interface FilterSidebarProps {
  categories: readonly string[];
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  onPriceFilterChange: (min?: number, max?: number) => void;
  onRatingFilterChange: (rating?: number) => void;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  onPriceFilterChange,
  onRatingFilterChange,
  minPrice,
  maxPrice,
  minRating,
}: FilterSidebarProps) {
  const [minPriceInput, setMinPriceInput] = useState(minPrice?.toString() || "");
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice?.toString() || "");

  const handleApplyPriceFilter = () => {
    const min = minPriceInput ? parseFloat(minPriceInput) : undefined;
    const max = maxPriceInput ? parseFloat(maxPriceInput) : undefined;
    onPriceFilterChange(min, max);
  };

  return (
    <div className="hidden md:block md:w-64 flex-shrink-0 mr-6">
      <div className="bg-white rounded-lg shadow p-4 mb-4 sticky top-4">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category}>
              <button
                className={cn(
                  "w-full text-left py-1 px-2 rounded transition hover:bg-gray-100",
                  selectedCategory === category && "bg-primary-50 text-primary-700"
                )}
                onClick={() => onCategoryChange(category as ProductCategory)}
              >
                {category === "all" 
                  ? "All Products" 
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        
        <hr className="my-4" />
        
        <h2 className="text-lg font-semibold mb-4">Price Range</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="min-price" className="block text-sm text-gray-600">Min Price</label>
            <Input
              type="number"
              id="min-price"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm text-gray-600">Max Price</label>
            <Input
              type="number"
              id="max-price"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <Button
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary-600 transition"
            onClick={handleApplyPriceFilter}
          >
            Apply Filter
          </Button>
        </div>
        
        <hr className="my-4" />
        
        
      </div>
    </div>
  );
}
