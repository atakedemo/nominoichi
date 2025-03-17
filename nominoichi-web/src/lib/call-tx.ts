import { getContract, parseUnits, parseSignature, createWalletClient, createPublicClient, http, custom } from 'viem'
import { baseSepolia } from 'viem/chains'
import { eip2612Permit, tokenAbi } from '@/lib/permit-helper'
import { purchaseNftAbi } from '@/lib/purchase-helper'

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
    console.log(Number(parseSignature(wrappedPermitSignature).v))
    console.log(parseSignature(wrappedPermitSignature).r)
    console.log(parseSignature(wrappedPermitSignature).s)
    const { request } = await client.simulateContract({
        address: ORDER_NFT,
        abi: purchaseNftAbi,
        functionName: 'purchase',
        account: ownerAddress,
        args: [
            4,
            signData.message.deadline,
            Number(parseSignature(wrappedPermitSignature).v),
            parseSignature(wrappedPermitSignature).r,
            parseSignature(wrappedPermitSignature).s
        ]
    })
    const tx_response = await walletClient.writeContract(request);
    return tx_response;
}

export async function ListProduct(
    ownerAddress: `0x${string}`
){
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum!)
    })
    const { request } = await publicClient.simulateContract({
        address: ORDER_NFT,
        abi: purchaseNftAbi,
        functionName: 'listProduct',
        account: ownerAddress,
        args: [0, parseUnits("10", 6) ,0]
    })
    const tx_response = await walletClient.writeContract(request);
    console.log(tx_response)
}