# AWS Services Decision Matrix

## Service Selection by Constraint

| Constraint | Recommended Services | Avoid |
|-----------|---------------------|-------|
| Budget < $25/mo | Lambda, S3, DynamoDB (on-demand), Lambda Function URLs | API Gateway (use Function URLs), NAT Gateway, ECS/EKS |
| Budget $25–$100/mo | Lambda, S3, API Gateway, DynamoDB, SQS, CloudWatch | ECS/EKS, RDS (use DynamoDB), ElastiCache |
| Budget > $100/mo | Full serverless stack, consider Graviton EC2 if compute-heavy | Over-provisioned RDS, multi-AZ unless required |
| Intermittent connectivity | SQS, S3 (upload retry), DynamoDB (TTL for offline sync) | Synchronous-only APIs, WebSockets |
| Shared devices | Cognito (session management), short-lived tokens | Long-lived credentials, device-bound auth |
| High user count (1000+) | API Gateway + Lambda, DynamoDB auto-scaling, CloudFront | Single EC2 instance, provisioned throughput |
| Video/media data | S3 + CloudFront, MediaConvert (if processing needed) | Storing media in DynamoDB, Lambda for transcoding |
| Documents only | S3, Textract (if OCR needed), DynamoDB for metadata | Over-engineered pipelines |

## Cost-Conscious Alternatives

| Standard Service | Low-Cost Alternative | Savings |
|-----------------|---------------------|---------|
| API Gateway REST | Lambda Function URLs | ~$3.50/million requests |
| NAT Gateway | VPC endpoints or public subnets | ~$32/mo base cost eliminated |
| RDS | DynamoDB on-demand | Pay-per-request vs hourly |
| CloudWatch detailed | Basic metrics + custom alarms | Free tier covers basics |
| Cognito (advanced) | Lambda authorizer + DynamoDB sessions | Avoid per-MAU costs |

## Free Tier Friendly Stack

These services have generous free tiers suitable for low-budget deployments:

- **Lambda** — 1M requests/mo, 400,000 GB-seconds
- **DynamoDB** — 25 GB storage, 25 RCU/WCU
- **S3** — 5 GB storage, 20,000 GET, 2,000 PUT
- **API Gateway** — 1M REST API calls/mo (12 months)
- **SQS** — 1M requests/mo
- **CloudWatch** — 10 custom metrics, 10 alarms
- **SNS** — 1M publishes, 1,000 email deliveries
