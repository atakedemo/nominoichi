import { parseUnits } from 'viem'
import { baseSepolia } from 'viem/chains'

export const tokenAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "permit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const

export async function eip2612Permit({
    token,
    chain,
    ownerAddress,
    spenderAddress,
    value
}: {
    token: any,
    chain: any,
    ownerAddress: `0x${string}`,
    spenderAddress: `0x${string}`,
    value: bigint
}) {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
    const nonce = await token.read.nonces([ownerAddress])
    
    return {
        types: {
            Permit: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        },
        domain: {
            name: 'USD Coin',
            version: '1',
            chainId: chain.id,
            verifyingContract: token.address
        },
        message: {
            owner: ownerAddress,
            spender: spenderAddress,
            value: value,
            nonce: nonce,
            deadline: deadline
        }
    }
}

export async function eip2612PermitPaymaster({
    token,
    chain,
    ownerAddress,
    spenderAddress,
    value
}: {
    token: any,
    chain: any,
    ownerAddress: `0x${string}`,
    spenderAddress: `0x${string}`,
    value: bigint
}) {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
    const nonce = await token.read.nonces([ownerAddress])
    
    return {
        types: {
            Permit: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        },
        domain: {
            name: 'USD Coin',
            version: '1',
            chainId: chain.id,
            verifyingContract: token.address
        },
        message: {
            owner: ownerAddress,
            spender: spenderAddress,
            value: value,
            nonce: nonce,
            deadline: deadline
        }
    }
} 