import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as elasticcache from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";
import { Role} from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";

interface RedisLambdaProps {
  readonly redisLambdaSecurityGroup: ec2.SecurityGroup;
  readonly vpc: ec2.Vpc;
  readonly redisCache: elasticcache.CfnCacheCluster;
  readonly timeoutSeconds?: number;
  readonly functionName: string;
  readonly code: lambda.Code;
  readonly handler: string;
  readonly redisLambdaRole: Role;
}

export class RedisLambdaConstruct extends Construct {
  public readonly redisLambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RedisLambdaProps) {
    super(scope, id);

    new lambda.Function(this, `${props.functionName}lambdaFn`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: props.functionName,
      handler: props.handler,
      code: props.code,
      role: props.redisLambdaRole,
      timeout: Duration.seconds(props.timeoutSeconds ?? 200),
      vpc: props.vpc,
      securityGroups: [props.redisLambdaSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      environment: {
        CACHE_URL: `redis://${props.redisCache.attrRedisEndpointAddress}:${props.redisCache.attrRedisEndpointPort}`,
      },
    });
  }
}
