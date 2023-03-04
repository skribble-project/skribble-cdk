import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { RedisLambdaStack } from "./stacks/redis-lambda/redis-lambda-stack";
import { RedisStack } from "./stacks/redis/redis-stack";
import { VpcStack } from "./stacks/vpc/vpc-stack";

export class SkribbleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcStack = new VpcStack(this, "vpc");

    const redisStack = new RedisStack(this, "redis", {
      vpc: vpcStack.vpc,
    });

    const redisLambdaStack = new RedisLambdaStack(this, "redisLambda", {
      redisCache: redisStack.redisCluster,
      vpc: vpcStack.vpc,
      redisSecurityGroup: redisStack.redisSecurityGroup,
    });
  }
}
