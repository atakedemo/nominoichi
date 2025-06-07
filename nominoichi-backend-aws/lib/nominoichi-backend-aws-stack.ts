import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as dotenv from 'dotenv';

dotenv.config();

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

    // /calltx/purchase/ POST
    const lambdaCalltxPurchasePost = new NodejsFunction(this, "lambdaCalltxPurchase", {
      entry: "lambda/calltx/purchase/post/index.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
      environment: {
        CHAIN: 'base-sepolia',
        PAYMASTER_ADDRESS: '0x31BE08D380A21fc740883c0BC434FcFc88740b58',
        USDC_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        ORDER_TOKEN_ADDRESS: process.env.ORDER_TOKEN_ADDRESS as string,
        BUNDLER_URL: 'https://public.pimlico.io/v2/84532/rpc?apikey=pim_XXjokYanBppsJQYkW2uNSo',
        PRIVATE_KEY: process.env.PRIVATE_KEY as string
      },
    });

    // /calltx/purchase-meta/ POST
    const lambdaCalltxPurchasemetaPost = new NodejsFunction(this, "lambdaCalltxPurchasemetaPost", {
      entry: "lambda/calltx/purchase-meta/post/index.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
      environment: {
        ORDER_TOKEN_ADDRESS: process.env.ORDER_TOKEN_ADDRESS as string,
        PRIVATE_KEY: process.env.PRIVATE_KEY as string,
        RPC_URL :process.env.RPC_URL as string,
      },
      timeout: cdk.Duration.seconds(150)
    });

    // /calltx/userop-gasprice/ GET
    const lambdaCalltxGaspriceGet = new NodejsFunction(this, "lambdaCalltxGaspriceGet", {
      entry: "lambda/calltx/userop-gasprice/get/index.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
    });

    //==========================
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

    // /calltx
    const apiGwCalltx = apiGw.root.addResource('calltx');

    // /calltx/purchase
    const apiGwCalltxPurchase = apiGwCalltx.addResource('purchase');
    apiGwCalltxPurchase.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaCalltxPurchasePost)
    );

    // /calltx/purchase-meta/ POST
    const apiGwCalltxPurchasemeta = apiGwCalltx.addResource('purchase-meta');
    apiGwCalltxPurchasemeta.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaCalltxPurchasemetaPost)
    );

    // /calltx/userop-gasprice
    const apiGwCalltxGasprice = apiGwCalltx.addResource('userop-gasprice');
    apiGwCalltxGasprice.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaCalltxGaspriceGet)
    );
  }
}
