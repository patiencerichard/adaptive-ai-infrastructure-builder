# Example: NGO Education Platform — Rural Tanzania

This is a sample output generated using the Adaptive AWS Architecture Builder prompt.

## Scenario

| Question | Answer |
|----------|--------|
| Use case | Education (offline-capable learning platform) |
| Monthly budget | $30 USD |
| Internet reliability | Intermittent |
| Expected users | 200 students |
| Shared devices | Yes |
| Data type | Documents (PDFs, quizzes) |

## Architecture Diagram

```
┌─────────────┐
│   Student    │
│  (Browser)   │
└──────┬───────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  CloudFront  │────▶│  S3 Bucket   │
│   (CDN)      │     │ (Static Site │
└──────┬───────┘     │  + Content)  │
       │             └──────────────┘
       ▼
┌─────────────┐     ┌──────────────┐
│ API Gateway  │────▶│   Lambda     │
│ (REST API)   │     │ (API Handler)│
└──────────────┘     └──────┬───────┘
                            │
                  ┌─────────┼─────────┐
                  ▼         ▼         ▼
           ┌──────────┐ ┌───────┐ ┌─────┐
           │ DynamoDB  │ │  SQS  │ │ S3  │
           │(Progress) │ │(Queue)│ │(PDF)│
           └──────────┘ └───┬───┘ └─────┘
                            ▼
                     ┌──────────┐
                     │  Lambda   │
                     │ (Grader)  │
                     └──────────┘
```

## Data Flow

1. Student opens the app via CloudFront (cached static site from S3)
2. Student authenticates with short-lived session token (shared device safe)
3. Student browses content served from S3 via CloudFront
4. Quiz submissions go to API Gateway → Lambda → SQS (buffered for intermittent connectivity)
5. Grader Lambda processes quiz from SQS, writes results to DynamoDB
6. Student fetches progress from API Gateway → Lambda → DynamoDB

## Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| Lambda (API + Grader) | ~$0 (free tier) |
| API Gateway | ~$1 |
| DynamoDB (on-demand) | ~$2 |
| S3 (5 GB content) | ~$0.12 |
| CloudFront (50 GB transfer) | ~$4.25 |
| SQS | ~$0 (free tier) |
| CloudWatch | ~$0 (free tier) |
| **Total** | **~$7.37/month** |

## Files

| File | Description |
|------|-------------|
| `lib/stack.ts` | AWS CDK infrastructure stack |
| `api/handler.ts` | Lambda API handler |
| `api/grader.ts` | Lambda quiz grader (SQS consumer) |
| `bin/app.ts` | CDK app entry point |
| `cdk.json` | CDK configuration |
| `tsconfig.json` | TypeScript configuration |

## Deploy

```bash
cd example
npm install
npx cdk synth      # preview CloudFormation template
npx cdk deploy      # deploy to AWS
```

## API Endpoints

### POST /quiz — Submit a quiz for grading

```json
// Request
{
  "userId": "student-001",
  "quizId": "quiz-001",
  "answers": ["A", "C", "B", "D", "A"]
}

// Response (202 Accepted)
{
  "message": "Quiz submitted for grading"
}
```

### GET /progress?userId=student-001 — Fetch student progress

```json
// Response (200 OK)
{
  "userId": "student-001",
  "progress": [
    {
      "quizId": "quiz-001",
      "score": 100,
      "submittedAt": "2025-07-14T10:30:00.000Z"
    }
  ]
}
```
