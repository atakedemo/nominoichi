import { 
    getContract, 
    parseUnits, 
    parseSignature, 
    parseErc6492Signature, 
    parseAbi,
    encodePacked,
    encodeFunctionData,
    hexToBigInt,
    type Hash,
    http,
} from 'viem'
import { toKernelSmartAccount } from 'permissionless/accounts'
import { createBundlerClient, entryPoint07Address } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import { eip2612Permit, eip2612PermitPaymaster, tokenAbi } from '@/lib/blockchain/permit'
import { orderTokenAbi } from '@/lib/blockchain/contracts'
import { publicClient, walletClient, BUNDLER_URL } from '@/lib/blockchain/client'
import { BASE_SEPOLIA_USDC, ORDER_TOKEN, PAYMASTER } from '@/lib/blockchain/constants'
import { API_ENDPOINTS } from '@/app/config/api'
import axios from 'axios'

export type TransactionMethod = 'aa' | 'x402'

export async function purchase(
    ownerAddress: `0x${string}`,
    method: TransactionMethod = 'aa'
): Promise<`0x${string}`> {
    switch (method) {
        case 'aa':
            return await purchaseWithPaymaster(ownerAddress)
        case 'x402':
            return await purchaseWithX402(ownerAddress)
        default:
            throw new Error('Invalid transaction method')
    }
}

async function purchaseWithPaymaster(ownerAddress: `0x${string}`): Promise<`0x${string}`> {
    const permitFee = parseUnits("1", 6)
    const smartAccount = await toKernelSmartAccount({
        client: publicClient,
        entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
        },
        owners: [window.ethereum!],
    })

    const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(BUNDLER_URL)
    })

    const usdc = getContract({
        client: publicClient,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })

    // Generate signature for Paymaster
    const permitDataPaymaster = await eip2612PermitPaymaster({
        token: usdc,
        chain: baseSepolia,
        ownerAddress: smartAccount.address,
        spenderAddress: PAYMASTER,
        value: permitFee
    })
    
    const signDataPaymaster = { ...permitDataPaymaster, primaryType: 'Permit' as const }
    const wrappedPermitSignaturePaymaster = await smartAccount.signTypedData(signDataPaymaster)
    const { signature: permitSignaturePaymaster } = parseErc6492Signature(wrappedPermitSignaturePaymaster)

    // Generate signature for orderToken
    const permitDataOrder = await eip2612Permit({
        token: usdc,
        chain: baseSepolia,
        ownerAddress: smartAccount.address,
        spenderAddress: ORDER_TOKEN,
        value: permitFee
    })
    
    const signDataOrder = { ...permitDataOrder, primaryType: 'Permit' as const }
    const wrappedPermitSignatureOrder = await smartAccount.signTypedData(signDataOrder)
    
    const calls = [{
        to: ORDER_TOKEN,
        abi: orderTokenAbi,
        functionName: 'purchase',
        args: [
            [BigInt(0)],
            [BigInt(1)],
            permitFee,
            signDataOrder.message.deadline,
            wrappedPermitSignatureOrder 
        ]
    }]

    const additionalGasCharge = hexToBigInt(
        (
            await publicClient.call({
                to: PAYMASTER,
                data: encodeFunctionData({
                    abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
                    functionName: 'additionalGasCharge'
                })
            })
        ).data ?? '0x0'
    )

    const feesRes = await axios.get(API_ENDPOINTS.USEROP_GAS_PRICE)
    const maxFeePerGas = hexToBigInt(feesRes.data.maxFeePerGas)
    const maxPriorityFeePerGas = hexToBigInt(feesRes.data.maxPriorityFeePerGas)

    const header = encodePacked(
        ['address', 'uint128', 'uint128'],
        [PAYMASTER, maxFeePerGas, maxPriorityFeePerGas]
    )
    
    const customData = encodePacked(
        ['uint8', 'address', 'uint256', 'bytes'],
        [0, usdc.address, permitFee, permitSignaturePaymaster]
    )
    
    const paymasterData = header + customData.slice(2) as `0x${string}`

    const {
        callGasLimit,
        preVerificationGas,
        verificationGasLimit,
        paymasterVerificationGasLimit,
        paymasterPostOpGasLimit
    } = await bundlerClient.estimateUserOperationGas({
        account: smartAccount,
        calls,
        paymaster: PAYMASTER,
        paymasterData,
        paymasterPostOpGasLimit: BigInt(30000),
        maxFeePerGas,
        maxPriorityFeePerGas
    })

    const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls,
        callGasLimit,
        preVerificationGas,
        verificationGasLimit,
        paymaster: PAYMASTER,
        paymasterData,
        paymasterVerificationGasLimit,
        paymasterPostOpGasLimit: BigInt(Math.max(
            Number(paymasterPostOpGasLimit),
            Number(additionalGasCharge)
        )),
    })

    await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash
    })

    return userOpHash
}

async function purchaseWithX402(ownerAddress: `0x${string}`): Promise<`0x${string}`> {
    const permitFee = parseUnits("1", 6)
    const usdc = getContract({
        client: publicClient,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })
    
    const permitData = await eip2612Permit({
        token: usdc,
        chain: baseSepolia,
        ownerAddress,
        spenderAddress: ORDER_TOKEN,
        value: permitFee
    })
    
    const signData = { ...permitData, primaryType: 'Permit' as const }
    const permitSignature = await walletClient.signTypedData({
        account: ownerAddress,
        primaryType: 'Permit',
        types: signData.types,
        domain: signData.domain,
        message: signData.message
    })

    const response = await axios.post(
        API_ENDPOINTS.PURCHASE,
        {
            chainId: 84532,
            permitSignature,
            deadline: signData.message.deadline.toString(),
            permitFee: permitFee.toString(),
            tokenIds: [0],
            amounts: [1],
            consumer: ownerAddress
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    return response.data.transactionHash
} 