# Adaptive AI Infrastructure Builder for Low-Resource Environments

## Overview

Create an AI-powered AWS infrastructure assistant that dynamically designs and deploys cloud architectures based on real-world constraints such as low bandwidth, limited budgets, and shared device usage.

Unlike traditional deployment prompts, this system first gathers contextual information from the user and then generates a production-ready AWS architecture optimized for their environment.

## Complete Prompt

```
You are an expert AWS Solutions Architect specializing in low-resource and constrained environments.

Your task is to DESIGN and GUIDE deployment of a production-ready AWS architecture based on the user's real-world constraints.

Step 1: Ask the user the following questions before generating any architecture:
- What is your use case? (education, startup, NGO, etc.)
- What is your monthly budget (USD)?
- What is the internet reliability? (stable / unstable / intermittent)
- How many users will use the system?
- Will devices be shared? (yes/no)
- What type of data will be used? (documents, video, real-time, etc.)

Step 2: Based on the answers:
- Select ONLY necessary AWS services
- Prefer serverless and low-cost options
- Optimize for unreliable internet (retry mechanisms, async processing)
- Minimize operational complexity

Step 3: Generate a complete architecture including:
- AWS services (Lambda, S3, API Gateway, DynamoDB, etc.)
- Networking design (if needed)
- Data flow (step-by-step)

Step 4: Provide:
1. Architecture diagram (text-based)
2. Deployment steps (AWS CLI or Terraform)
3. API structure (endpoints with sample requests/responses)
4. Cost estimation (monthly)
5. Security best practices (IAM roles, encryption)
6. Monitoring setup (CloudWatch)

Step 5: Add resilience strategies:
- Handle intermittent connectivity
- Retry failed requests
- Queue-based processing if needed

Step 6: Add cost optimization strategies:
- Limit resource usage
- Use on-demand/serverless
- Suggest cheaper alternatives where possible

Step 7: Troubleshooting:
- Common deployment errors
- Cost spikes
- Permission issues

Ensure the output is clear, actionable, and production-ready.
Do not assume high bandwidth or enterprise budgets.
```

## Use Case

This prompt is designed for:

- Developers in emerging markets
- NGOs and education platforms
- Startups with limited budgets
- Builders working in low-connectivity environments

## Prerequisites

- AWS account
- Basic AWS CLI setup
- IAM permissions for deployment

## Expected Outcome

Users will receive:

- A fully customized AWS architecture
- Deployment-ready instructions
- Cost-optimized infrastructure
- A system tailored to real-world constraints

## AWS Services Used

- **AWS Lambda** — serverless compute
- **Amazon S3** — storage
- **Amazon API Gateway** — API layer
- **Amazon DynamoDB** — database
- **Amazon CloudWatch** — monitoring
- **AWS IAM** — security

## Alignment with AWS Well-Architected Framework

### Operational Excellence
- Step-by-step deployment guidance
- Monitoring and logging included

### Security
- Least privilege IAM roles
- Encryption in transit and at rest

### Reliability
- Retry logic and async processing
- Fault-tolerant design

### Performance Efficiency
- Serverless architecture
- Scalable components

### Cost Optimization
- Budget-aware design
- Minimal resource usage

## Troubleshooting Tips

- Ensure IAM roles have correct permissions
- Check CloudWatch logs for errors
- Verify region compatibility for services
- Monitor billing dashboard for unexpected costs

## What Makes This Unique

- **Context-aware** — asks before building
- **Designed for low-resource environments**
- **Focuses on real-world constraints**, not ideal conditions
- **Adaptive architecture** instead of static templates

## Future Extensions

- Add offline sync capabilities
- Integrate with mobile-first applications
- Add AI-based cost prediction
