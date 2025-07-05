"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoninConnectButton } from "./RoninConnectButton";
import { FlowConnectButton } from "./FlowConnectButton";

const Header = () => {
  const pathname = usePathname();
  const isRoninPage = pathname === "/ronin";
  const isFlowPage = pathname === "/flow";

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
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="PredictMeBro Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold text-white">
                PredictMeBro
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`transition-colors ${pathname === "/" ? "text-white" : "text-gray-300 hover:text-white"}`}
            >
              Home
            </Link>
            <Link 
              href="/flow" 
              className={`transition-colors ${pathname === "/flow" ? "text-purple-400" : "text-gray-300 hover:text-white"}`}
            >
              Flow Markets
            </Link>
            <Link 
              href="/ronin" 
              className={`transition-colors ${pathname === "/ronin" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
            >
              Ronin Markets
            </Link>
            <Link 
              href="/demos" 
              className={`transition-colors ${pathname === "/demos" ? "text-white" : "text-gray-300 hover:text-white"}`}
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