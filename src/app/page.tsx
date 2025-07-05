import { ToastDemo } from "@/components/demo/toast-demo";
import { WagmiDemo } from "@/components/demo/wagmi-demo";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">PredictMePro</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Next.js App with Sonner Toast & Wagmi Integration
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
            <ToastDemo />
          </div>
          
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
            <WagmiDemo />
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid gap-4 md:grid-cols-2 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🍞 Sonner Toast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful toast notifications with multiple variants, descriptions, and action buttons.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🏦 Wagmi Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect to Ethereum wallets, display account info, and interact with blockchain.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
