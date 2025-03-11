import { 
    createWalletClient, 
    createPublicClient, 
    custom, 
    http,
  } from "viem";
  import { baseSepolia } from "viem/chains";
  import "viem/window";
  
  export const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!)
  })
   
  export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })