# Sample Scenarios and Expected Outputs

## Scenario 1: NGO Education Platform in Rural Tanzania

**User Responses:**
- Use case: Education (offline-capable learning platform)
- Budget: $30/month
- Internet: Intermittent
- Users: 200 students
- Shared devices: Yes
- Data type: Documents (PDFs, quizzes)

**Expected Architecture:**

```
Mobile/Browser → CloudFront → S3 (static site + content)
                      ↓
               API Gateway → Lambda → DynamoDB (user progress)
                                ↓
                              SQS → Lambda (quiz grading, async)
```

**Services Selected:**
- S3 + CloudFront (content delivery, works offline with service worker)
- Lambda Function URLs (keep costs under budget)
- DynamoDB on-demand (student progress tracking)
- SQS (async quiz processing for intermittent connections)
- Cognito (short sessions for shared devices)

**Estimated Cost:** ~$18/month

---

## Scenario 2: Budget Startup MVP in Lagos

**User Responses:**
- Use case: Startup (marketplace MVP)
- Budget: $50/month
- Internet: Unstable
- Users: 500
- Shared devices: No
- Data type: Documents + images

**Expected Architecture:**

```
Client → API Gateway → Lambda → DynamoDB (listings, users)
              ↓            ↓
         CloudFront    S3 (images via presigned URLs)
                           ↓
                     SQS → Lambda (image processing)
```

**Services Selected:**
- API Gateway + Lambda (API layer)
- DynamoDB on-demand (listings and user data)
- S3 (image storage with presigned URL uploads)
- SQS (async image processing)
- CloudWatch (basic alarms for errors and cost)

**Estimated Cost:** ~$35/month

---

## Scenario 3: Community Health Data Collection

**User Responses:**
- Use case: NGO (health data collection in field)
- Budget: $15/month
- Internet: Intermittent (field workers sync when in town)
- Users: 50 field workers
- Shared devices: Yes (tablets)
- Data type: Forms and documents

**Expected Architecture:**

```
Tablet (offline forms) → sync when online → Lambda Function URL → DynamoDB
                                                    ↓
                                              S3 (form attachments)
```

**Services Selected:**
- Lambda Function URLs (no API Gateway cost)
- DynamoDB on-demand (form submissions)
- S3 (attachments)
- SQS (buffer for batch sync)

**Estimated Cost:** ~$8/month
