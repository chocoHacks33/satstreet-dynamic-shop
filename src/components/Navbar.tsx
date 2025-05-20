
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  User,
  ShoppingCart,
  Wallet,
  LogOut,
  ChevronDown,
  Store,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout, isSeller } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-satstreet-dark py-4">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-white flex items-center"
          >
            <img 
              src="/logo-satstreet.png" 
              alt="SatStreet Logo" 
              className="h-8 mr-2" 
            />
            <span><span className="text-bitcoin">Sat</span>Street</span>
          </Link>
        </div>

        <div className="flex space-x-2 sm:space-x-4 items-center mt-4 sm:mt-0">
          <Link to="/" className="text-white hover:text-gray-300">
            <Home className="w-5 h-5 sm:mr-1 sm:inline-block" />
            <span className="hidden sm:inline-block">Home</span>
          </Link>
          
          <Link to="/cart" className="text-white hover:text-gray-300 ml-4">
            <ShoppingCart className="w-5 h-5 sm:mr-1 sm:inline-block" />
            <span className="hidden sm:inline-block">Cart</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/wallet" className="text-white hover:text-gray-300 ml-4">
                <Wallet className="w-5 h-5 sm:mr-1 sm:inline-block" />
                <span className="hidden sm:inline-block">Wallet</span>
              </Link>

              {isSeller && (
                <Link to="/seller" className="text-white hover:text-gray-300 ml-4">
                  <Store className="w-5 h-5 sm:mr-1 sm:inline-block" />
                  <span className="hidden sm:inline-block">Seller Dashboard</span>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white hover:text-gray-300 flex items-center ml-4">
                    <User className="w-5 h-5 sm:mr-1" />
                    <span className="hidden sm:inline-block">{user?.username || 'Account'}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled>
                      <div className="flex flex-col">
                        <span>Signed in as</span>
                        <span className="font-medium">{user?.username || user?.email}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate("/wallet")}>
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>

                    {!isSeller && (
                      <DropdownMenuItem onSelect={() => navigate("/seller/register")}>
                        <Store className="mr-2 h-4 w-4" />
                        <span>Become a Seller</span>
                      </DropdownMenuItem>
                    )}

                    {isSeller && (
                      <DropdownMenuItem onSelect={() => navigate("/seller")}>
                        <Store className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex ml-4">
              <Button
                variant="outline"
                className="mr-2 border-gray-600 text-white hover:text-white hover:bg-satstreet-medium"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button className="bg-bitcoin hover:bg-bitcoin-dark text-white" 
                onClick={() => navigate("/register")}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
