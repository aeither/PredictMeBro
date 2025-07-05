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
      <Button variant="outline" className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-800">
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </Button>
    );
  };

  return (
    <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
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
              to="/demo/tanstack-query" 
              className={`transition-colors ${location.pathname === "/demo/tanstack-query" ? "text-white" : "text-gray-300 hover:text-white"}`}
            >
              Demos
            </Link>
          </nav>
          
          {renderConnectButton()}
        </div>
      </div>
    </header>
  );
};

export default Header;
