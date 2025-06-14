import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exact } from "x402/schemes";
import { getUsdcAddressForChain } from "x402/shared/evm";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { amount, recipient, chainId } = body;

    if (!amount || !recipient || !chainId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount, recipient, and chainId are required' })
      }; 
    }

    const usdcAddress = getUsdcAddressForChain(chainId);
    const paymentRequirements = {
      scheme: exact.SCHEME,
      network: {
        chainId: Number(chainId)
      },
      token: usdcAddress,
      amount: BigInt(amount),
      recipient
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        paymentRequirements
      })
    };
  } catch (error) {
    console.error('Error processing USDC payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};