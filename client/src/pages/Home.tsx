import { useState } from "react";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import MobileFilters from "@/components/MobileFilters";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";
import { ProductCategory, PRODUCT_CATEGORIES } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sortOption, setSortOption] = useState("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { 
    products, 
    filteredProducts, 
    isLoading, 
    isError 
  } = useFilteredProducts({
    category: selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
    sortOption,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const handlePriceFilterChange = (min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleRatingFilterChange = (rating?: number) => {
    setMinRating(rating);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setSortOption("featured");
    setSearchQuery("");
  };

  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        onSearch={handleSearch} 
        searchQuery={searchQuery} 
        onToggleFilters={toggleMobileFilters}
      />
      
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col md:flex-row">
          <FilterSidebar
            categories={PRODUCT_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onPriceFilterChange={handlePriceFilterChange}
            onRatingFilterChange={handleRatingFilterChange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
          />
          
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === "all" 
                      ? "All Products" 
                      : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label htmlFor="sortOrder" className="text-gray-600 text-sm hidden sm:inline">Sort by:</label>
                  <select 
                    id="sortOrder" 
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="rounded border-gray-300 py-1 text-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating-desc">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
            
            <ProductGrid 
              products={filteredProducts} 
              isLoading={isLoading} 
              isError={isError}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </main>

      {isMobileFiltersOpen && (
        <MobileFilters
          categories={PRODUCT_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onPriceFilterChange={handlePriceFilterChange}
          onRatingFilterChange={handleRatingFilterChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          onClose={() => setIsMobileFiltersOpen(false)}
          onApply={() => setIsMobileFiltersOpen(false)}
          onReset={handleResetFilters}
        />
      )}
      
      <Footer />
    </div>
  );
}
