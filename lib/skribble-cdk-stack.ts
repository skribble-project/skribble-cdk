import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { RedisLambdaStack } from "./stacks/redis-lambda/redis-lambda-stack";
import { RedisStack } from "./stacks/redis/redis-stack";
import { VpcStack } from "./stacks/vpc/vpc-stack";

export class SkribbleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcStack = new VpcStack(this, "SkribbleVpcStack");

    const redisStack = new RedisStack(this, "SkribbleRedisStack", {
      vpc: vpcStack.vpc,
    });

    const redisLambdaStack = new RedisLambdaStack(
      this,
      "SkribbleRedisLambdaStack",
      {
        redisCache: redisStack.redisCluster,
        vpc: vpcStack.vpc,
        redisSecurityGroup: redisStack.redisSecurityGroup,
      }
    );
  }
}
