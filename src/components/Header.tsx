import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { Link, useLocation } from '@tanstack/react-router'
import { RoninConnectButton } from "./RoninConnectButton";
import { FlowConnectButton } from "./FlowConnectButton";

const Header = () => {
  const location = useLocation();
  const isRoninPage = location.pathname === "/ronin";
  const isFlowPage = location.pathname === "/flow";

  const renderConnectButton = () => {
    if (isRoninPage) {
      return <RoninConnectButton />;
    }
    
    if (isFlowPage) {
      return <FlowConnectButton />;
    }

    return (
      <Button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg backdrop-blur-sm">
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </Button>
    );
  };

  return (
    <header className="border-b border-gray-700/50 glass-dark sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <h1 className="text-xl font-bold text-white">
                PredictMeBro
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`transition-colors ${location.pathname === "/" ? "text-white" : "text-gray-300 hover:text-white"}`}
            >
              Home
            </Link>
            <Link 
              to="/flow" 
              className={`transition-colors ${location.pathname === "/flow" ? "text-purple-400" : "text-gray-300 hover:text-white"}`}
            >
              Flow Markets
            </Link>
            <Link 
              to="/ronin" 
              className={`transition-colors ${location.pathname === "/ronin" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
            >
              Ronin Markets
            </Link>

            <Link 
              to="/supabase-demo" 
              className={`transition-colors ${location.pathname === "/supabase-demo" ? "text-green-400" : "text-gray-300 hover:text-white"}`}
            >
              Realtime Demo
            </Link>
          </nav>
          
          {renderConnectButton()}
        </div>
      </div>
    </header>
  );
};

export default Header;
