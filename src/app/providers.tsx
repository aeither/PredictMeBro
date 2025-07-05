"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { getDefaultConfig, TantoProvider } from '@sky-mavis/tanto-widget'
import { PrivyProvider } from '@privy-io/react-auth'
import { ronin, saigon } from 'viem/chains'
import { defineChain } from 'viem'

// Define Flow mainnet chain for Privy
const flowMainnet = defineChain({
  id: 747,
  name: 'Flow Mainnet',
  network: 'flow-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW'
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org']
    }
  },
  blockExplorers: {
    default: {
      name: 'Flow Block Explorer',
      url: 'https://flowscan.org'
    }
  }
})

// Create Tanto Widget config for Ronin
const tantoConfig = getDefaultConfig({
  keylessWalletConfig: {
    clientId: process.env.NEXT_PUBLIC_TANTO_CLIENT_ID || '',
  },
  appMetadata: {
    appName: 'PredictMeBro',
    appIcon: '/logo.png',
    appDescription: 'Decentralized sentiment prediction market platform',
    appUrl: 'https://predictmebro.com',
  },
  chains: [ronin, saigon, flowMainnet],
  initialChainId: 2020, // Ronin Mainnet
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <WagmiProvider config={tantoConfig}>
      <QueryClientProvider client={queryClient}>
        <TantoProvider 
          theme="dark"
          config={{
            initialChainId: 2020, // Ronin Mainnet
          }}
        >
          {privyAppId ? (
            <PrivyProvider
              appId={privyAppId}
              config={{
                appearance: {
                  theme: 'dark',
                  accentColor: '#7C3AED',
                  logo: '/logo.png',
                  showWalletLoginFirst: false,
                },
                loginMethods: ['email', 'wallet', 'sms'],
                defaultChain: flowMainnet,
                supportedChains: [flowMainnet],
                embeddedWallets: {
                  createOnLogin: 'users-without-wallets',
                  requireUserPasswordOnCreate: false,
                },
              }}
            >
              {children}
            </PrivyProvider>
          ) : (
            children
          )}
        </TantoProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 