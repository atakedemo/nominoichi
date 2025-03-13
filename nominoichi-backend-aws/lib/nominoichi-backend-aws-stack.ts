import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class NominoichiBackendAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "lambda", {
      entry: "lambda/order/update.ts",
      handler: "lambdaHandler",
      runtime: Runtime.NODEJS_20_X,
    });
  }
}
