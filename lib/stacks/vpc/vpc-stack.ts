import { IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

const resourceName = "SkribbleVpc";

export class VpcStack extends cdk.Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "SkribbleVpc", {
      maxAzs: 1,
      natGateways: 1,
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      subnetConfiguration: [
        {
          name: `${resourceName}PublicSubnet`,
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: `${resourceName}PrivateSubnet`,
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
