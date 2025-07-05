import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
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
              <h1 className="text-xl font-bold bg-clip-text text-white text-transparent">
                PredictMeBro
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/flow" className="text-gray-300 hover:text-white transition-colors">
              Flow Markets
            </Link>
            <Link href="/ronin" className="text-gray-300 hover:text-white transition-colors">
              Ronin Markets
            </Link>
            <Link href="/demos" className="text-gray-300 hover:text-white transition-colors">
              Demos
            </Link>
          </nav>
          
          <Button variant="outline" className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-800">
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 