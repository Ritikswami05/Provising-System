import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">ProductHub</h3>
            <p className="text-gray-400 text-sm">Your one-stop shop for quality products and services at competitive prices.</p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">All Products</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Electronics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Fashion</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Home & Garden</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Shipping Information</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates and exclusive offers.</p>
            <form className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="w-full rounded-l text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary" 
              />
              <Button type="submit" className="bg-primary hover:bg-primary-600 text-white px-4 rounded-r transition">
                <FaArrowRight />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; 2023 ProductHub. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
