import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createPublicClient, http, hexToBigInt } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const client = createPublicClient({
            chain: baseSepolia,
            transport: http()
        })

        const bundlerClient = createBundlerClient({
            client,
            transport: http('https://public.pimlico.io/v2/84532/rpc')
        })

        const { standard: fees } = await bundlerClient.request({
            method: 'pimlico_getUserOperationGasPrice' as any
        }) as { standard: { maxFeePerGas: `0x${string}`, maxPriorityFeePerGas: `0x${string}` } }
        const maxFeePerGas = hexToBigInt(fees.maxFeePerGas)
        const maxPriorityFeePerGas = hexToBigInt(fees.maxPriorityFeePerGas)
        console.log('maxFeePerGas is ..', maxFeePerGas)
        console.log('maxPriorityFeePerGas is ... ', maxPriorityFeePerGas)

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: "Tx is succed!!" ,
                maxFeePerGas: fees.maxFeePerGas,
                maxPriorityFeePerGas: fees.maxPriorityFeePerGas
            }),
        };
    } catch(err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
}

