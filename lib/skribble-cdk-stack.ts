import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { RedisStack } from "./stacks/redis/redis-stack";
import { VpcStack } from "./stacks/vpc/vpc-stack";

export class SkribbleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcStack = new VpcStack(this, "SkribbleVpcStack");

    const redisStack = new RedisStack(this, "SkribbleRedisStack", {
      vpc: vpcStack.vpc,
    });
  }
}
