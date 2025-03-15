import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class NominoichiBackendAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //==========================
    // DB (DynamoDB)
    //==========================
    const tableOrder = new dynamodb.Table(this, 'dynamodbOrder', {
      partitionKey: { name: 'tokenId', type: dynamodb.AttributeType.STRING },
      tableName: 'Order',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    tableOrder.addGlobalSecondaryIndex({
      indexName: 'OwnerIndex',
      partitionKey: { name: 'ownerAddress', type: dynamodb.AttributeType.STRING },
    });
    tableOrder.addGlobalSecondaryIndex({
      indexName: 'ConsumerIndex',
      partitionKey: { name: 'consumerAddress', type: dynamodb.AttributeType.STRING },
    });

    //==========================
    // API (API Gateway, Lambda)
    //==========================
    // Lambda
    // /order POST
    const lambdaOrderPost = new NodejsFunction(this, "lambdaOrderPost", {
      entry: "lambda/order/post/index.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: tableOrder.tableName,
      },
    });
    tableOrder.grantReadWriteData(lambdaOrderPost);

    // /order GET
    const lambdaOrderGet = new NodejsFunction(this, "lambdaOrderGet", {
      entry: "lambda/order/get/index.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: tableOrder.tableName,
      },
    });
    tableOrder.grantReadData(lambdaOrderGet);

    // API Gateway
    const apiGw = new apigateway.RestApi(this, 'NominoichiApi', { 
      cloudWatchRole: false,
      restApiName: "NominoichiApi",
      deployOptions: {
        stageName: "test",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
    })

    // /order
    const apiGwOrder = apiGw.root.addResource('order');
    apiGwOrder.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaOrderPost)
    );
  }
}
