import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambdaEvents from "aws-cdk-lib/aws-lambda-event-sources";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";

export class EduPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3: Static site + PDF content
    const contentBucket = new s3.Bucket(this, "ContentBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // CloudFront CDN
    const cdn = new cloudfront.Distribution(this, "CDN", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(contentBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
    });

    // DynamoDB: Student progress
    const progressTable = new dynamodb.Table(this, "ProgressTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "quizId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.DEFAULT,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // SQS: Quiz submission queue (buffer for intermittent connectivity)
    const quizQueue = new sqs.Queue(this, "QuizQueue", {
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: new sqs.Queue(this, "QuizDLQ", {
          retentionPeriod: cdk.Duration.days(14),
        }),
        maxReceiveCount: 3,
      },
    });

    // Lambda: API handler
    const apiHandler = new lambda.Function(this, "ApiHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "handler.handler",
      code: lambda.Code.fromAsset("api"),
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: progressTable.tableName,
        QUEUE_URL: quizQueue.queueUrl,
        CONTENT_BUCKET: contentBucket.bucketName,
      },
    });

    progressTable.grantReadWriteData(apiHandler);
    quizQueue.grantSendMessages(apiHandler);
    contentBucket.grantRead(apiHandler);

    // Lambda: Quiz grader (SQS consumer)
    const grader = new lambda.Function(this, "Grader", {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "grader.handler",
      code: lambda.Code.fromAsset("api"),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: progressTable.tableName,
      },
    });

    progressTable.grantReadWriteData(grader);
    grader.addEventSource(
      new lambdaEvents.SqsEventSource(quizQueue, { batchSize: 5 })
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "EduApi", {
      restApiName: "EduPlatformAPI",
      deployOptions: {
        throttlingRateLimit: 100,
        throttlingBurstLimit: 50,
      },
    });

    const quizResource = api.root.addResource("quiz");
    quizResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(apiHandler)
    );

    const progressResource = api.root.addResource("progress");
    progressResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(apiHandler)
    );

    // CloudWatch: Cost and error alarms
    new cloudwatch.Alarm(this, "ApiErrorAlarm", {
      metric: apiHandler.metricErrors({ period: cdk.Duration.minutes(5) }),
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: "API handler errors exceeded threshold",
    });

    new cloudwatch.Alarm(this, "DLQAlarm", {
      metric: quizQueue.metricApproximateNumberOfMessagesVisible({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 1,
      alarmDescription: "Dead letter queue has unprocessed messages",
    });

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
    new cdk.CfnOutput(this, "CdnUrl", {
      value: `https://${cdn.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, "ContentBucketName", {
      value: contentBucket.bucketName,
    });
  }
}
