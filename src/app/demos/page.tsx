import ToastDemo from "@/components/demo/toast-demo";
import { WagmiDemo } from "@/components/demo/wagmi-demo";
import CreatePoolForm from "@/components/CreatePoolForm";

export default function DemosPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#ededed' }}>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#ededed' }}>
            Component Demos
          </h1>
          <p className="text-xl" style={{ color: '#a0a0a0' }}>
            Test the toast notifications and wallet integration features
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg shadow-sm" style={{ 
            backgroundColor: '#1a1a1a', 
            borderColor: '#333',
            color: '#ededed'
          }}>
            <ToastDemo />
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm" style={{ 
            backgroundColor: '#1a1a1a', 
            borderColor: '#333',
            color: '#ededed'
          }}>
            <WagmiDemo />
          </div>
        </div>

        {/* Create Pool Form */}
        <div className="mt-12 max-w-2xl mx-auto">
          <CreatePoolForm />
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#ededed' }}>Features</h2>
          <div className="grid gap-4 md:grid-cols-3 text-left max-w-6xl mx-auto">
            <div className="p-4 border rounded-lg" style={{ 
              backgroundColor: '#1a1a1a', 
              borderColor: '#333'
            }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#ededed' }}>🍞 Sonner Toast</h3>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>
                Beautiful toast notifications with multiple variants, descriptions, and action buttons.
              </p>
            </div>
            <div className="p-4 border rounded-lg" style={{ 
              backgroundColor: '#1a1a1a', 
              borderColor: '#333'
            }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#ededed' }}>🏦 Wagmi Integration</h3>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>
                Connect to Ethereum wallets, display account info, and interact with blockchain.
              </p>
            </div>
            <div className="p-4 border rounded-lg" style={{ 
              backgroundColor: '#1a1a1a', 
              borderColor: '#333'
            }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#ededed' }}>🎯 Pool Creation</h3>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>
                Create new prediction markets with Supabase database integration and real-time updates.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 