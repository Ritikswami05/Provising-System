import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onResetFilters: () => void;
}

export default function ProductGrid({ 
  products, 
  isLoading, 
  isError,
  onResetFilters
}: ProductGridProps) {
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setVisibleProducts((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">We couldn't load the products. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div id="no-results" className="py-10 text-center">
        <div className="text-gray-500 text-xl">No products match your search criteria</div>
        <Button 
          onClick={onResetFilters} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 transition"
        >
          Reset Filters
        </Button>
      </div>
    );
  }

  const displayedProducts = products.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < products.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {isLoadingMore && (
          <>
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>
      
      {hasMoreProducts && !isLoadingMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition flex items-center"
            onClick={handleLoadMore}
          >
            <span>Load more products</span>
            <FaChevronDown className="ml-2" />
          </Button>
        </div>
      )}
    </>
  );
}
