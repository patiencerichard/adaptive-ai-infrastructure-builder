# Architecture Patterns by Constraint

## Pattern 1: Minimal Serverless (Budget < $25/mo)

Best for: Small NGOs, student projects, prototypes.

```
Client → Lambda Function URL → DynamoDB
                ↓
               S3 (static assets)
```

- No API Gateway (use Lambda Function URLs)
- DynamoDB on-demand mode
- S3 for static hosting with CloudFront free tier
- CloudWatch basic metrics only

## Pattern 2: Standard Serverless (Budget $25–$100/mo)

Best for: Education platforms, small startups, internal tools.

```
Client → API Gateway → Lambda → DynamoDB
              ↓            ↓
         CloudFront       SQS → Lambda (async)
              ↓
             S3
```

- API Gateway with throttling
- SQS for async/retry workloads
- DynamoDB with auto-scaling
- CloudWatch alarms for cost and errors

## Pattern 3: Resilient Serverless (Intermittent Connectivity)

Best for: Emerging markets, rural deployments, mobile-first apps.

```
Client → API Gateway → Lambda → SQS → Lambda (processor)
              ↓                          ↓
         (retry on 5xx)            DynamoDB (with TTL)
                                         ↓
                                    S3 (results)
```

- SQS as buffer for unreliable connections
- Exponential backoff on client retries
- DynamoDB TTL for stale data cleanup
- S3 for offline-capable content delivery via CloudFront

## Pattern 4: Data-Heavy (Documents/Media)

Best for: Document management, education content delivery.

```
Client → S3 (presigned URL upload) → Lambda (trigger)
                                        ↓
                                   DynamoDB (metadata)
                                        ↓
                                   CloudFront → Client (download)
```

- Presigned URLs for direct S3 upload (skip Lambda payload limits)
- S3 event triggers for processing
- CloudFront for low-latency delivery
- Textract integration if OCR needed

## Pattern 5: Shared Device (Multi-User on Same Device)

Best for: Schools, community centers, shared workstations.

```
Client → API Gateway → Lambda Authorizer → Lambda → DynamoDB
                            ↓
                     Cognito (short sessions)
```

- Short-lived session tokens (15–30 min)
- Cognito with forced re-auth
- No persistent local storage of credentials
- Per-user data isolation in DynamoDB (partition key = user ID)

## Resilience Strategies

| Strategy | When to Use | Implementation |
|----------|------------|----------------|
| SQS buffering | Intermittent connectivity | Client → API → SQS → Lambda processor |
| Exponential backoff | Unreliable network | Client-side retry with 2^n * 100ms delay |
| DynamoDB TTL | Stale data cleanup | Set TTL attribute on records |
| S3 presigned URLs | Large uploads on slow connections | Generate URL server-side, upload direct to S3 |
| CloudFront caching | Reduce origin calls | Cache static content at edge |
| Dead letter queues | Failed processing | SQS DLQ after 3 retries |
