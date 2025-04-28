import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaFilter, FaHeart, FaUser, FaSignOutAlt } from "react-icons/fa";
import CartIcon from "@/components/CartIcon";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onToggleFilters: () => void;
}

export default function Header({ onSearch, searchQuery, onToggleFilters }: HeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">VSN 
              INTERNATIONAL PROVISIONING SYSTEM</span>
            </a>
          </div>
          
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Input
                id="searchDesktop"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 h-5 w-5 text-gray-400 hover:text-primary"
                onClick={() => onSearch(searchQuery)}
              >
                <FaSearch />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={toggleMobileSearch}
            >
              <FaSearch className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={onToggleFilters}
            >
              <FaFilter className="h-5 w-5" />
            </Button>
            <a href="#" className="hidden sm:block text-gray-600 hover:text-primary">
              <FaHeart className="h-5 w-5" />
            </a>
            <CartIcon />
            
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm font-medium">
                  {user.username}
                </span>
                {user.isAdmin && (
                  <Link href="/admin">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="flex items-center gap-1"
                >
                  <FaSignOutAlt className="h-3 w-3" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FaUser className="h-3 w-3" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search - Hidden by default */}
        {isMobileSearchOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Input
                id="searchMobile"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 h-5 w-5 text-gray-400 hover:text-primary"
                onClick={() => onSearch(searchQuery)}
              >
                <FaSearch />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
