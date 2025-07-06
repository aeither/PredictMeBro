import { TantoConnectButton } from '@sky-mavis/tanto-widget';
import { toast } from "sonner";

export function RoninConnectButton() {
  return (
    <TantoConnectButton>
      {({ isConnected, showModal, address }) => {
        if (isConnected && address) {
          return (
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div className="text-xs text-gray-400">
                  Ronin Network
                </div>
              </div>
            </div>
          );
        }

        return (
          <button
            onClick={() => {
              showModal();
              toast.info("Connecting to Ronin Wallet...");
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg backdrop-blur-sm"
          >
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span>Connect Ronin</span>
          </button>
        );
      }}
    </TantoConnectButton>
  );
} 