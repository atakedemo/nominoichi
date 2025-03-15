import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME!;

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log(event.body)
        const body = JSON.parse(event.body || '{}');
        const { tokenId, ownerAddress, consumerAddress, consumer } = body;

        // ToDo: 署名とNFT所有の検証
        // ~~

        if (!tokenId  === undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'データ項目を指定してください' }),
            };
        }
        const updateResult = await ddbDocClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { tokenId },
            UpdateExpression: "set ownerId = :ownerId, consumerAddress = :consumerAddress, consumer = :consumer",
            ExpressionAttributeValues: {
              ":ownerId": ownerAddress,
              ":consumerAddress": consumerAddress,
              ":consumer": consumer,
            },
            ReturnValues: "ALL_NEW"
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Item updated", item: updateResult.Attributes }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};