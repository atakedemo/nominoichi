import { getContract, parseUnits, createWalletClient, createPublicClient, custom, http, parseSignature } from 'viem'
import { baseSepolia } from 'viem/chains'
import { eip2612Permit, tokenAbi } from '@/lib/permit-helper'

const BASE_SEPOLIA_USDC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_USDC as `0x${string}`;
const ORDER_NFT = process.env.NEXT_PUBLIC_ORDER_NFT as `0x${string}`;

export async function Purchase(
    ownerAddress: `0x${string}`
){
    const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum!)
    })
       
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    const usdc = getContract({
        client,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })
    const permitData = await eip2612Permit({
        token: usdc,
        chain: baseSepolia,
        ownerAddress,
        spenderAddress: ORDER_NFT,
        value: parseUnits("10", 6)
    })
    const signData = { ...permitData, primaryType: 'Permit' as const }
    const wrappedPermitSignature = await walletClient.signTypedData({
        account: ownerAddress,
        primaryType: 'Permit',
        types: signData.types,
        domain: signData.domain,
        message: signData.message
    })
    console.log(parseSignature(wrappedPermitSignature))
    console.log(wrappedPermitSignature)
}