import * as elasticcache from "aws-cdk-lib/aws-elasticache";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { Construct } from "constructs";

export interface RedisStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
}

const resourceName = "SkribbleRedis";

export class RedisStack extends cdk.Stack {
  public readonly redisCluster: elasticcache.CfnCacheCluster;
  public readonly redisSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RedisStackProps) {
    super(scope, id, props);

    const redisSubnetGroup = new elasticcache.CfnSubnetGroup(
      this,
      `${resourceName}SubnetGroup`,
      {
        description: "Subnet group for the redis cluster",
        subnetIds: props.vpc.publicSubnets.map((ps) => ps.subnetId),
        cacheSubnetGroupName: "Skribble-Redis-Subnet-Group",
      }
    );

    this.redisSecurityGroup = new ec2.SecurityGroup(
      this,
      `${resourceName}SecurityGroup`,
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: "Security group for the redis cluster",
      }
    );

    this.redisCluster = new elasticcache.CfnCacheCluster(
      this,
      `${resourceName}Cache`,
      {
        engine: "redis",
        cacheNodeType: "cache.t4g.small",
        numCacheNodes: 1,
        clusterName: "SkribbleRedisCluster",
        autoMinorVersionUpgrade: true,
        vpcSecurityGroupIds: [this.redisSecurityGroup.securityGroupId],
        cacheSubnetGroupName: redisSubnetGroup.ref,
      }
    );


    this.redisCluster.addDependency(redisSubnetGroup);

    new cdk.CfnOutput(this, `${resourceName}CacheEndpointUrl`, {
      value: this.redisCluster.attrRedisEndpointAddress,
    });

    new cdk.CfnOutput(this, `${resourceName}CachePort`, {
      value: this.redisCluster.attrRedisEndpointPort,
    });
  }
}
