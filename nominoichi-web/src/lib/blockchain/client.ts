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

export const BUNDLER_URL = 'https://bundler.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44' 