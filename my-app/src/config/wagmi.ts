import { createConfig, http } from 'wagmi'
import { flowMainnet, flowTestnet } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// Flow blockchain configuration
export const config = createConfig({
  chains: [flowMainnet, flowTestnet],
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
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 