import { 
    getContract, 
    parseUnits, 
    parseSignature, 
    parseErc6492Signature, 
    parseAbi,
    encodePacked,
    encodeFunctionData,
    createWalletClient, 
    createPublicClient, 
    http, 
    custom,
    hexToBigInt,
} from 'viem'
import { toEcdsaKernelSmartAccount, toKernelSmartAccount } from 'permissionless/accounts'
import { createBundlerClient , entryPoint07Address} from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import { eip2612Permit, eip2612PermitPaymaster, tokenAbi} from '@/lib/permit-helper'
import { orderTokenAbi } from '@/lib/purchase-helper'
import axios from 'axios'

const BASE_SEPOLIA_USDC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_USDC as `0x${string}`;
const ORDER_TOKEN = process.env.NEXT_PUBLIC_ORDER_TOKEN as `0x${string}`;
const PAYMASTER = process.env.NEXT_PUBLIC_BASE_SEPOLIA_PAYMASTER as `0x${string}`;
const MAX_GAS_USDC = process.env.NEXT_PUBLIC_MAX_GAS_USDC as string;

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
    const permitFee = parseUnits("1", 6);
    const usdc = getContract({
        client,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })
    const permitData = await eip2612Permit({
        token: usdc,
        chain: baseSepolia,
        ownerAddress,
        spenderAddress: ORDER_TOKEN,
        value: parseUnits("1", 6)
    })
    const signData = { ...permitData, primaryType: 'Permit' as const }
    const wrappedPermitSignature = await walletClient.signTypedData({
        account: ownerAddress,
        primaryType: 'Permit',
        types: signData.types,
        domain: signData.domain,
        message: signData.message
    })
    console.log("signature is ...")
    console.log(wrappedPermitSignature)
    console.log(Number(parseSignature(wrappedPermitSignature).v))
    console.log(parseSignature(wrappedPermitSignature).r)
    console.log(parseSignature(wrappedPermitSignature).s)
    const { request } = await client.simulateContract({
        address: ORDER_TOKEN,
        abi: orderTokenAbi,
        functionName: 'purchase',
        account: ownerAddress,
        args: [
            [0],
            [1],
            permitFee,
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
        address: ORDER_TOKEN,
        abi: orderTokenAbi,
        functionName: 'listProduct',
        account: ownerAddress,
        args: [0, parseUnits("1", 6) ,0]
    })
    const tx_response = await walletClient.writeContract(request);
    console.log(tx_response)
}

export async function PurchaseAa(
    ownerAddress: `0x${string}`
){
    console.log(ownerAddress)   
}

// With Paymaster
export async function PurchaseWithPaymaster(
    ownerAddress: `0x${string}`
){     
    const permitFee = parseUnits("1", 6);
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    // const smartAccount = await toEcdsaKernelSmartAccount({
    //     client,
    //     owners: [window.ethereum!],
    //     version: '0.3.1'
    // })
    const smartAccount = await toKernelSmartAccount({
        client,
        entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
        },
        owners: [window.ethereum!],
    })
    console.log(ownerAddress)
    console.log(smartAccount)

    const bundlerClient = createBundlerClient({
        client,
        transport: http('https://bundler.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44')
    })

    const usdc = getContract({
        client,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })

    // Generate signature for Paymaster
    const permitDataPaymaster = await eip2612PermitPaymaster({
        token: usdc,
        chain: baseSepolia,
        ownerAddress: smartAccount.address,
        spenderAddress: PAYMASTER,
        value: parseUnits("1", 6)
    })
    const signDataPayamster = { ...permitDataPaymaster, primaryType: 'Permit' as const }
    const wrappedPermitSignaturePaymaster = await smartAccount.signTypedData(signDataPayamster)
    const { signature: permitSignaturePaymaster } = parseErc6492Signature(wrappedPermitSignaturePaymaster)
    console.log(parseErc6492Signature(wrappedPermitSignaturePaymaster))
    console.log('wrappedPermitSignaturePaymaster is ...',wrappedPermitSignaturePaymaster  )
    console.log('permitSignaturePaymaster is ...', permitSignaturePaymaster)
    console.log(parseSignature("0x" + permitSignaturePaymaster.slice(-130) as `0x${string}`))

    // Generate signature for orderToken
    const permitDataOrder = await eip2612Permit({
        token: usdc,
        chain: baseSepolia,
        ownerAddress: smartAccount.address,
        spenderAddress: ORDER_TOKEN,
        value: parseUnits("1", 6)
    })
    const signDataOrder = { ...permitDataOrder, primaryType: 'Permit' as const }
    const wrappedPermitSignatureOrder = await smartAccount.signTypedData(signDataOrder)
    
    const calls = [
        {
            to: ORDER_TOKEN,
            abi: orderTokenAbi,
            functionName: 'purchase',
            args: [
                [0],
                [1],
                permitFee,
                signDataOrder.message.deadline,
                wrappedPermitSignatureOrder 
            ]
        }
    ]
    // const calls = [
    //     {
    //     to: usdc.address,
    //     abi: usdc.abi,
    //     functionName: 'transfer',
    //     args: ['0x9bAf0536590Cf54feF9b7c11598ad14028d86842', BigInt(1000)]
    //     }
    // ]

    const additionalGasCharge = hexToBigInt(
        (
            await client.call({
                to: PAYMASTER,
                data: encodeFunctionData({
                    abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
                    functionName: 'additionalGasCharge'
                })
            })
        ).data ?? '0x0'
    );
    console.log('additionalGasCharge is ...', additionalGasCharge)

    const feesRes = await axios.get("https://llbwjcy034.execute-api.ap-northeast-1.amazonaws.com/test/calltx/userop-gasprice")
    console.log(feesRes)
    const maxFeePerGas = hexToBigInt(feesRes.data.maxFeePerGas)
    const maxPriorityFeePerGas = hexToBigInt(feesRes.data.maxPriorityFeePerGas)
    console.log('maxFeePerGas is ..', maxFeePerGas)
    console.log('maxPriorityFeePerGas is ... ', maxPriorityFeePerGas)

    const header = encodePacked(
        ['address', 'uint128', 'uint128'],
        [
            PAYMASTER,
            maxFeePerGas,
            maxPriorityFeePerGas
        ]
    );
    const customData = encodePacked(
        ['uint8', 'address', 'uint256', 'bytes'],
        [
            0, 
            usdc.address, 
            parseUnits("1", 6), 
            permitSignaturePaymaster
        ]
    );
    const paymasterData = header + customData.slice(2) as `0x${string}`;
    console.log('paymasterData is ...', paymasterData)

    // // Estimate gas limits
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
        // paymasterPostOpGasLimit: additionalGasCharge * BigInt(5),
        paymasterPostOpGasLimit: BigInt(30000),
        maxFeePerGas,
        maxPriorityFeePerGas
    })
    console.log(callGasLimit)
    console.log(preVerificationGas)
    console.log(verificationGasLimit)

    // Send user operation
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
    // Wait for receipt
    const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash
    })
    
    console.log(userOpReceipt)
}

export async function getSmartAccountBalance(){
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    const smartAccount = await toEcdsaKernelSmartAccount({
        client,
        owners: [window.ethereum!],
        version: '0.3.1'
    })
    console.log('Smart Account is ...', smartAccount)

    const usdc = getContract({
        client,
        address: BASE_SEPOLIA_USDC,
        abi: tokenAbi
    })
    const usdcBalance = await usdc.read.balanceOf([smartAccount.address]);
    console.log('Balance is ...', usdcBalance)
}

export async function PurchaseMeta(
    ownerAddress: `0x${string}`
) {
    const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum!)
    })
    console.log(window.ethereum)
    console.log(walletClient.transport)
       
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })
    const permitFee = parseUnits("1", 6);
    const usdc = getContract({
        client,
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
    console.log("signature is ...")
    console.log(permitSignature)

    const apiRes = await axios.post(
        'https://llbwjcy034.execute-api.ap-northeast-1.amazonaws.com/test/calltx/purchase-meta',
        {
            chainId: 84532,
            permitSignature: permitSignature,
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
    console.log(apiRes)
}