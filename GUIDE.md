# How to Use This Prompt — Complete Guide

This guide walks you through everything: how to install, how to use, and how to deploy the results.

---

## What Is This?

This is **not** an application you install and run. It's a **prompt** — a set of instructions you give to an AI assistant. The AI then becomes your personal AWS architect and builds a custom infrastructure for your specific situation.

```
Traditional approach:  Google → Read docs → Trial and error → Maybe it works
This prompt:           Paste prompt → Answer 6 questions → Get deployable infrastructure
```

---

## Installation

Choose your preferred method. Kiro CLI is recommended.

---

### Method 1: Kiro CLI (Recommended)

Kiro automatically reads the prompt from the project's `.kiro/` folder — no copy-pasting needed.

#### Install Kiro CLI

**macOS (Homebrew):**
```bash
brew install --cask kiro-cli
```

**Manual download:**
Go to https://kiro.dev and download the installer for your OS.

**Verify installation:**
```bash
kiro-cli-chat --version
```

#### Clone and Run

```bash
# Clone the repo
git clone https://github.com/patiencerichard/adaptive-ai-infrastructure-builder.git

# Enter the project
cd adaptive-ai-infrastructure-builder

# Start Kiro chat — it automatically loads the prompt
kiro-cli-chat
```

That's it. Kiro reads `.kiro/product.md` and `.kiro/rules.md` from the project and knows exactly what to do. Just type:

```
I need to build an AWS infrastructure for my project
```

Kiro will start asking you the 6 questions:

```
1% > I need to build an AWS infrastructure for my project

> Let me ask you the 6 key questions to design the right architecture:

1. Use case — What does your app do?
2. Budget — Monthly AWS spend limit?
3. Connectivity — Reliable internet or intermittent?
4. Users — How many concurrent users?
5. Devices — What do users access it from?
6. Data — What kind of data are you storing/processing?
```

Answer all 6, and Kiro generates your full architecture.

---

### Method 2: Amazon Q Developer (IDE)

#### Install Amazon Q

1. Open VS Code (or your preferred IDE)
2. Go to Extensions → Search "Amazon Q"
3. Install the **Amazon Q Developer** extension
4. Sign in with your AWS Builder ID (free)

#### Use the Prompt

1. Clone the repo:
   ```bash
   git clone https://github.com/patiencerichard/adaptive-ai-infrastructure-builder.git
   ```

2. Open the project folder in your IDE

3. Open Amazon Q chat panel (sidebar)

4. Type:
   ```
   @PROMPT.md I need to build an AWS infrastructure for my project
   ```

   Or manually copy the prompt from `PROMPT.md` (everything inside the code block) and paste it into the Amazon Q chat.

5. Answer the 6 questions when asked.

---

### Method 3: Any AI Assistant (ChatGPT, Claude, etc.)

No installation needed — just copy and paste.

1. Open `PROMPT.md` from this repo (or view it on GitHub)

2. Copy everything inside the code block — it starts with:
   ```
   You are an expert AWS Solutions Architect specializing in low-resource...
   ```
   And ends with:
   ```
   Prefer free-tier friendly and cost-conscious designs wherever possible
   ```

3. Open your AI assistant (ChatGPT, Claude, Gemini, etc.)

4. Paste the prompt

5. The AI will ask you 6 questions — answer them

6. Receive your custom architecture

---

## Prerequisites for Deployment

After the AI generates your architecture, you'll need these to deploy it:

### AWS Account
1. Go to https://aws.amazon.com → "Create an AWS Account"
2. You get 12 months of free tier — enough for most architectures this prompt generates

### AWS CLI
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download from https://aws.amazon.com/cli/

# Verify
aws --version
```

### Configure Credentials
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your region (e.g., us-east-1)
# Enter output format (json)
```

### AWS CDK
```bash
npm install -g aws-cdk
cdk --version
```

---

## Using the Prompt — Step by Step

### Step 1: Start a Conversation

Using whichever method you chose above, start a conversation with the AI. The AI will ask you 6 questions:

```
AI: What is your use case? (e.g., education, startup, NGO, etc.)
You: Education — an offline-capable learning platform for students in rural Tanzania

AI: What is your monthly budget in USD?
You: $30

AI: What is the internet reliability? (stable / unstable / intermittent)
You: Intermittent

AI: What is the expected number of users?
You: 200 students

AI: Will devices be shared? (yes / no)
You: Yes — tablets shared across classrooms

AI: What type of data will be handled? (documents, video, real-time, etc.)
You: Documents — PDFs and quizzes
```

### Step 2: Receive Your Custom Architecture

After answering all 6 questions, the AI generates:

| Deliverable | What it is |
|------------|-----------|
| Architecture Overview | How all the pieces fit together |
| Architecture Diagram | Text-based visual of the data flow |
| Infrastructure as Code | CDK (TypeScript) or Terraform — ready to deploy |
| Deployment Guide | Step-by-step commands |
| API Design | Endpoints with sample requests/responses |
| Cost Estimate | Monthly cost matching your budget |
| Security Setup | IAM roles, encryption, access patterns |
| Monitoring | CloudWatch alarms and logging |
| Resilience | Retry logic, queues, offline handling |
| Troubleshooting | Common errors and fixes |

The AI tailors everything to your answers. A $30/month NGO gets a completely different architecture than a $500/month startup.

### Step 3: Save the Generated Code

Copy the CDK/Terraform code the AI generated into your project. If using the example in this repo as a starting point:

```bash
cd example
```

Or create a new project with the AI-generated files.

---

## Deploying to AWS

### First Time Only — Bootstrap CDK

```bash
# Get your account ID
aws sts get-caller-identity --query Account --output text

# Bootstrap (replace YOUR_ACCOUNT_ID and region)
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### Deploy

```bash
cd example
npm install
npx cdk synth    # Preview what will be created (recommended)
npx cdk deploy   # Deploy to AWS
```

CDK asks for confirmation:
```
Do you wish to deploy these changes (y/n)? y
```

Type `y`. Deployment takes 2–5 minutes.

### Deployment Outputs

After deployment you'll see:
```
Outputs:
EduPlatformStack.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
EduPlatformStack.CdnUrl = https://d1234567.cloudfront.net
EduPlatformStack.ContentBucketName = eduplatformstack-contentbucket-xyz
```

Save these — you'll need them.

---

## Testing Your API

Using the API URL from deployment:

### Submit a quiz
```bash
curl -X POST https://YOUR_API_URL/prod/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student-001",
    "quizId": "quiz-001",
    "answers": ["A", "C", "B", "D", "A"]
  }'
```

Response:
```json
{ "message": "Quiz submitted for grading" }
```

### Check student progress
```bash
curl "https://YOUR_API_URL/prod/progress?userId=student-001"
```

Response (after a few seconds for async grading):
```json
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

### Upload content
```bash
aws s3 cp my-lesson.pdf s3://YOUR_BUCKET_NAME/lessons/my-lesson.pdf
aws s3 sync ./my-site s3://YOUR_BUCKET_NAME/
```

Content is available via CloudFront at your CDN URL.

---

## Monitoring

```bash
# Lambda logs (live)
aws logs tail /aws/lambda/EduPlatformStack-ApiHandler --follow
aws logs tail /aws/lambda/EduPlatformStack-Grader --follow

# Check alarms
aws cloudwatch describe-alarms --state-value ALARM

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2025-07-01,End=2025-07-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## Cleanup

When done, remove everything:

```bash
cd example
npx cdk destroy
```

S3 bucket and DynamoDB table have `RETAIN` policy — delete manually:
```bash
aws s3 rm s3://YOUR_BUCKET_NAME --recursive
aws s3 rb s3://YOUR_BUCKET_NAME
aws dynamodb delete-table --table-name YOUR_TABLE_NAME
```

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────┐
│  INSTALL                                                │
│                                                         │
│  Option A: git clone → cd project → kiro-cli-chat       │
│  Option B: git clone → open in IDE → Amazon Q chat      │
│  Option C: Copy prompt from PROMPT.md → paste into AI   │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  USE                                                    │
│                                                         │
│  AI asks 6 questions about your situation               │
│  You answer → AI generates custom architecture          │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  DEPLOY                                                 │
│                                                         │
│  npm install → cdk synth → cdk deploy                   │
│  Test API endpoints → Upload content → Monitor          │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  LIVE AWS INFRASTRUCTURE                                │
│                                                         │
│  Production-ready, cost-optimized, tailored to you      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `kiro-cli-chat` not found | Run `brew install --cask kiro-cli` or check `~/.local/bin/` is in your PATH |
| `cdk bootstrap` fails | Check credentials: `aws sts get-caller-identity` |
| `cdk deploy` permission error | Your IAM user needs Lambda, S3, DynamoDB, API Gateway, SQS, CloudWatch, CloudFront, IAM permissions |
| API returns 500 | Check logs: `aws logs tail /aws/lambda/FUNCTION_NAME --follow` |
| Progress shows empty after quiz submit | Grading is async — wait a few seconds and retry |
| DLQ has messages | Check: `aws sqs get-queue-attributes --queue-url DLQ_URL --attribute-names ApproximateNumberOfMessages` |
| Unexpected AWS charges | Run `aws ce get-cost-and-usage`, set billing alarm, run `cdk destroy` when done |

---

## Different Scenarios, Different Results

The example in this repo is for one scenario. The AI adapts to your answers:

| Your Situation | What the AI Does Differently |
|---------------|------------------------------|
| Budget < $25/mo | Skips API Gateway, uses Lambda Function URLs |
| Stable internet | Skips SQS queues, uses synchronous processing |
| No shared devices | Simpler auth, longer session tokens |
| Video data | Adds CloudFront media caching, S3 multipart uploads |
| 1000+ users | Adds DynamoDB auto-scaling, API Gateway throttling |
| Real-time data | Adds WebSocket API or AppSync |

Every combination of answers produces a different architecture. That's the point — it adapts to you.
