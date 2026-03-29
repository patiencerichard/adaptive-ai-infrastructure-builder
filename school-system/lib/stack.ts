import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SchoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── Cognito User Pool ──────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'SchoolUserPool', {
      selfSignUpEnabled: false, // admin creates accounts
      signInAliases: { email: true },
      passwordPolicy: { minLength: 8, requireSymbols: false },
      autoVerify: { email: true },
    });

    const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admin',
    });

    const teacherGroup = new cognito.CfnUserPoolGroup(this, 'TeacherGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Teacher',
    });

    const parentGroup = new cognito.CfnUserPoolGroup(this, 'ParentGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Parent',
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'SchoolAppClient', {
      userPool,
      authFlows: { userPassword: true, userSrp: true },
    });

    // ── DynamoDB (single-table) ────────────────────────────────────────
    const table = new dynamodb.Table(this, 'SchoolData', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI for querying by class
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    // ── S3 Buckets ─────────────────────────────────────────────────────
    const docsBucket = new s3.Bucket(this, 'DocsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    new cloudfront.CloudFrontWebDistribution(this, 'CDN', {
      originConfigs: [{
        s3OriginSource: { s3BucketSource: siteBucket },
        behaviors: [{ isDefaultBehavior: true, compress: true }],
      }],
    });

    // ── Lambda (single handler with routing) ──────────────────────────
    const apiLambda = new lambda.Function(this, 'ApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: docsBucket.bucketName,
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    table.grantReadWriteData(apiLambda);
    docsBucket.grantReadWrite(apiLambda);
    apiLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminAddUserToGroup'],
      resources: [userPool.userPoolArn],
    }));

    // ── API Gateway with Cognito Authorizer ───────────────────────────
    const api = new apigateway.RestApi(this, 'SchoolApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(apiLambda);
    const authOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Routes
    for (const path of ['students', 'grades', 'attendance', 'fees', 'documents', 'reports']) {
      const resource = api.root.addResource(path);
      resource.addMethod('GET', lambdaIntegration, authOptions);
      resource.addMethod('POST', lambdaIntegration, authOptions);
      const item = resource.addResource('{id}');
      item.addMethod('GET', lambdaIntegration, authOptions);
      item.addMethod('PUT', lambdaIntegration, authOptions);
      item.addMethod('DELETE', lambdaIntegration, authOptions);
    }

    // ── Outputs ───────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'DocsBucketName', { value: docsBucket.bucketName });
    new cdk.CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
  }
}
