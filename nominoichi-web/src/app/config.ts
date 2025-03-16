import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains'
// import { walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http()
  },
})