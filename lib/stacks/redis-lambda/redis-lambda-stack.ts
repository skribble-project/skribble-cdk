import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticcache from "aws-cdk-lib/aws-elasticache";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { Role, ManagedPolicy, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { RedisLambdaConstruct } from "./lambdas/redis-lambda-construct";

interface RedisLambdaProps extends cdk.StackProps {
  readonly vpc: Vpc;
  readonly redisCache: elasticcache.CfnCacheCluster;
  readonly redisSecurityGroup: ec2.SecurityGroup;
}

export class RedisLambdaStack extends cdk.Stack {
  private readonly redisLambdaSecurityGroup: ec2.SecurityGroup;
  private readonly redisLambdaRole: Role;

  constructor(scope: Construct, id: string, props: RedisLambdaProps) {
    super(scope, id, props);

    this.redisLambdaRole = new Role(this, `SkribbleLambdaRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: "Role that has access to AmazonElasticache",
    });

    this.redisLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonElastiCacheFullAccess")
    );

    this.redisLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaENIManagementAccess"
      )
    );

    this.redisLambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      `SkribbleLambdaSG`,
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        securityGroupName: "redis-lambdaFn Security Group",
      }
    );

    this.redisLambdaSecurityGroup.connections.allowTo(
      props.redisSecurityGroup,
      ec2.Port.tcp(6379),
      "Allow this lambda function connect to the redis cache"
    );

    const functionName = "HostGame";
    new RedisLambdaConstruct(this, `"${functionName}Lambda"`, {
      functionName,
      vpc: props.vpc,
      handler: "index.handler",
      redisCache: props.redisCache,
      redisLambdaRole: this.redisLambdaRole,
      redisLambdaSecurityGroup: this.redisLambdaSecurityGroup,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../test-lambda")),
    });
  }
}
