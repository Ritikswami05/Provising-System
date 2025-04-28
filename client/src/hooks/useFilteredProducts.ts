import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCategory, type Product } from "@shared/schema";

interface UseFilteredProductsProps {
  category: ProductCategory;
  searchQuery: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortOption: string;
}

export function useFilteredProducts({
  category,
  searchQuery,
  minPrice,
  maxPrice,
  minRating,
  sortOption,
}: UseFilteredProductsProps) {
  // Fetch products
  const { data, isLoading, isError } = useQuery<Product[]>({
    queryKey: [category === "all" ? "/api/products" : `/api/products/category/${category}`],
  });
  
  // Ensure products is always an array
  const products = data || [];

  // Apply filters and sorting using useMemo instead of useState + useEffect
  const filteredProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    let result = [...products];

    // Apply text search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (product) => 
          product.name.toLowerCase().includes(lowerCaseQuery) || 
          product.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply price filters
    if (minPrice !== undefined) {
      result = result.filter((product) => parseFloat(product.price as string) >= minPrice);
    }
    
    if (maxPrice !== undefined) {
      result = result.filter((product) => parseFloat(product.price as string) <= maxPrice);
    }

    // Apply rating filter
    if (minRating !== undefined) {
      result = result.filter((product) => parseFloat(product.rating as string) >= minRating);
    }

    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case "price-asc":
          return [...result].sort((a, b) => 
            parseFloat(a.price as string) - parseFloat(b.price as string)
          );
        case "price-desc":
          return [...result].sort((a, b) => 
            parseFloat(b.price as string) - parseFloat(a.price as string)
          );
        case "name-asc":
          return [...result].sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
          return [...result].sort((a, b) => b.name.localeCompare(a.name));
        case "rating-desc":
          return [...result].sort((a, b) => 
            parseFloat(b.rating as string) - parseFloat(a.rating as string)
          );
        // "featured" is default, no sorting needed
        default:
          return result;
      }
    }

    return result;
  }, [products, searchQuery, minPrice, maxPrice, minRating, sortOption]);

  return {
    products,
    filteredProducts,
    isLoading,
    isError,
  };
}
