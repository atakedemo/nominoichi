import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
    createPublicClient, 
    http, 
    getContract,
    parseUnits,
    parseAbi, 
    hexToBigInt, 
    encodeFunctionData, 
    erc20Abi,
    encodePacked,
} from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts'
import { eip2612Abi, tokenAbi, orderTokenAbi } from '../../../lib/abi'

const API_KEY = process.env.API_KEY!;
const CHAIN = process.env.CHAIN!;
const ORDER_TOKEN_ADDRESS = process.env.ORDER_TOKEN_ADDRESS as `0x${string}`;
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.USDC_ADDRESS as `0x${string}`;
const MAX_GAS_USDC = BigInt(1000000);
const BUNDLER_URL = process.env.BUNDLER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

const request_url = "https://"+ CHAIN +".g.alchemy.com/v2/" + API_KEY
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log(event.body)
        const body = JSON.parse(event.body || '{}');
        const { 
            callData, 
            sender, 
            permitFee, 
            permitSignatureOrder, 
            deadlineOrder ,
            permitSignaturePaymaster,
            deadlinePaymaster
        } = body;

        // ToDo: 署名とNFT所有の検証
        // ~~

        const client = createPublicClient({
            chain: baseSepolia,
            transport: http()
        })
        const bundlerClient = createBundlerClient({
            client,
            transport: http(BUNDLER_URL)
        })
        const owner = privateKeyToAccount(PRIVATE_KEY)
        const account = await toEcdsaKernelSmartAccount({
            client,
            owners: [owner],
            version: '0.3.1'
        })

        const usdc = getContract({
            client,
            address: USDC_ADDRESS,
            abi: [...erc20Abi,...eip2612Abi, ...tokenAbi]
        })

        const paymasterData = encodePacked(
            ['uint8', 'address', 'uint256', 'bytes'],
            [0, usdc.address, MAX_GAS_USDC, permitSignaturePaymaster]
        )

        const additionalGasCharge = hexToBigInt(
            (
                await client.call({
                    to: PAYMASTER_ADDRESS,
                    data: encodeFunctionData({
                        abi: parseAbi(['function additionalGasCharge() returns (uint256)']),
                        functionName: 'additionalGasCharge'
                    })
                })
            ).data ?? '0x0'
        );

        const calls = [
            {
                to: ORDER_TOKEN_ADDRESS,
                abi: orderTokenAbi,
                functionName: 'purchase',
                args: [
                    [0],
                    [1],
                    permitFee,
                    deadlineOrder,
                    permitSignatureOrder
                ]
            }
        ]

        const { standard: fees } = await bundlerClient.request({
            method: 'pimlico_getUserOperationGasPrice' as any
        }) as { standard: { maxFeePerGas: `0x${string}`, maxPriorityFeePerGas: `0x${string}` } }
        const maxFeePerGas = hexToBigInt(fees.maxFeePerGas)
        const maxPriorityFeePerGas = hexToBigInt(fees.maxPriorityFeePerGas)
        const {
            callGasLimit,
            preVerificationGas,
            verificationGasLimit,
            paymasterPostOpGasLimit,
            paymasterVerificationGasLimit
        } = await bundlerClient.estimateUserOperationGas({
            account,
            calls,
            paymaster: PAYMASTER_ADDRESS,
            paymasterData,
            paymasterPostOpGasLimit: additionalGasCharge,
            maxFeePerGas: BigInt(1),
            maxPriorityFeePerGas: BigInt(1)
        })
        // Send user operation
        const userOpHash = await bundlerClient.sendUserOperation({
            account,
            calls,
            callGasLimit,
            preVerificationGas,
            verificationGasLimit,
            paymaster: PAYMASTER_ADDRESS,
            paymasterData,
            paymasterVerificationGasLimit,
            paymasterPostOpGasLimit: BigInt(Math.max(
                Number(paymasterPostOpGasLimit),
                Number(additionalGasCharge)
            )),
            maxFeePerGas,
            maxPriorityFeePerGas
        })
        // Wait for receipt
        const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
            hash: userOpHash
        })
        console.log(userOpReceipt)
        // const req_body = {
        //     "id": 1,
        //     "jsonrpc": "2.0",
        //     "method": "eth_sendUserOperation",
        //     "params": [
        //         {
        //             "sender": sender,
        //             "nonce": "0x3",
        //             "callData": callData,
        //             "callGasLimit": "0x7A1200",
        //             "verificationGasLimit": "0x927C0",
        //             "preVerificationGas": "0x15F90",
        //             "maxFeePerGas": "0x656703D00",
        //             "maxPriorityFeePerGas": "0x13AB6680",
        //             "paymasterVerificationGasLimit": "0x927C0",
        //             "paymasterPostOpGasLimit": "0x927C0",
        //             "signature": permitSignaturePaymaster,
        //             "paymaster": PAYMASTER_ADDRESS,
        //             "paymasterData": paymasterData
        //         },
        //         "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
        //     ]
        // }
        // const req_headers = {
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json',
        // }

        // await axios.post(request_url, req_body, {headers: req_headers})
        // .then(function (response) {
        //     console.log('Finish API!!!')
        //     console.log(response)
        // })
        // .catch(function (error) {
        //     console.log(error)
        // });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Tx is succed!!" }),
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