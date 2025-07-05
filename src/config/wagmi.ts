import { http, createConfig } from 'wagmi'
import { ronin, flowMainnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [ronin, flowMainnet],
  transports: {
    [ronin.id]: http(),
    [flowMainnet.id]: http(),
  },
}) 