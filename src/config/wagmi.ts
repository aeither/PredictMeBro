import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { flowMainnet, flowTestnet } from 'wagmi/chains'
import { ronin, saigon } from 'viem/chains'

// Multi-chain configuration for Flow and Ronin using Privy's integrated wagmi
export const config = createConfig({
  chains: [flowMainnet, flowTestnet, ronin, saigon],
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