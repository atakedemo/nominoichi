import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME!;

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const ownerAddress = event.queryStringParameters?.ownerAddress;
    const tokenId = event.queryStringParameters?.tokenId;

    if (ownerAddress) {
        const result = await ddbDocClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'OwnerIndex',
            KeyConditionExpression: 'ownerAddress = :ownerAddress',
            ExpressionAttributeValues: {
                ':ownerAddress': ownerAddress,
            },
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ items: result.Items }),
        };
    }
    
    if (tokenId) {
        const result = await ddbDocClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { tokenId },
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ item: result.Item }),
        };
    }
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message: "ownerAddressまたはtokenIdのクエリパラメータを指定してください" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error occurred", error: error.message }),
    };
  }
};
