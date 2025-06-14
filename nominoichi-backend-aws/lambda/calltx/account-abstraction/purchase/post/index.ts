import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createPublicClient, createWalletClient, http, custom ,parseSignature } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { orderTokenAbi } from '../../../../lib/abi'

const ORDER_TOKEN_ADDRESS = process.env.ORDER_TOKEN_ADDRESS as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log(event.body)
        const body = JSON.parse(event.body || '{}');
        const { 
            chainId,
            permitSignature,
            deadline,
            permitFee,
            tokenIds,
            amounts,
            consumer
        } = body;

        // ToDo: 署名とNFT所有の検証
        // ~~


        // トークン購入のTx実行
        const client = createPublicClient({
            chain: baseSepolia,
            transport: http()
        })
        const account = privateKeyToAccount(PRIVATE_KEY)
        const walletClientEoa = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http(RPC_URL)
        })
        console.log('account is ...', account)
        console.log('wallet is ...', walletClientEoa)

        const { request } = await client.simulateContract({
            address: ORDER_TOKEN_ADDRESS,
            abi: orderTokenAbi,
            functionName: 'purchase',
            account: account.address,
            args: [
                tokenIds,
                amounts,
                BigInt(permitFee),
                BigInt(deadline),
                permitSignature,
                consumer
            ]
        })
        console.log(request)
        const tx_response = await walletClientEoa.writeContract(request);
        console.log(tx_response)

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(tx_response),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};