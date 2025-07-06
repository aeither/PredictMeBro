import { createConfig, http } from 'wagmi'
import { flowMainnet, flowTestnet } from 'wagmi/chains'
import { ronin, saigon } from 'viem/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// Multi-chain configuration for Flow and Ronin
export const config = createConfig({
  chains: [flowMainnet, flowTestnet, ronin, saigon],
  connectors: [
    metaMask(),
    coinbaseWallet(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [flowMainnet.id]: http(),
    [flowTestnet.id]: http(),
    [ronin.id]: http(),
    [saigon.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 