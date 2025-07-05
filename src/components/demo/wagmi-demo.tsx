"use client"

import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi"
import { injected } from "wagmi/connectors"
import { toast } from "sonner"

export function WagmiDemo() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    connect({ connector: injected() }, {
      onSuccess: () => {
        toast.success("Wallet Connected", {
          description: "Your wallet has been connected successfully",
        })
      },
      onError: (error) => {
        toast.error("Connection Failed", {
          description: error.message,
        })
      },
    })
  }

  const handleDisconnect = () => {
    disconnect()
    toast.info("Wallet Disconnected", {
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Wagmi Demo</h3>
      
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        {isConnected ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Address:</span> {address}
            </p>
            {ensName && (
              <p className="text-sm">
                <span className="font-medium">ENS Name:</span> {ensName}
              </p>
            )}
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your wallet to get started
            </p>
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isPending ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 