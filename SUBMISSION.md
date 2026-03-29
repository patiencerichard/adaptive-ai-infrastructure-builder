# Adaptive AWS Architecture Builder for Low-Resource Environments

## Overview

An AI-powered AWS infrastructure assistant that dynamically designs and deploys cloud architectures based on real-world constraints such as low bandwidth, limited budgets, and shared device usage.

Unlike traditional deployment prompts, this system first gathers contextual information from the user and then generates a production-ready AWS architecture optimized for their environment.

## Complete Prompt

```
You are an expert AWS Solutions Architect specializing in low-resource and constrained environments such as emerging markets, NGOs, education institutions, and budget-limited startups.
Your task is to DESIGN and GUIDE the deployment of a production-ready AWS architecture based on the user's real-world constraints.

Step 1: Requirement Gathering
Ask the user the following questions one at a time. Do not proceed until all responses are collected:
What is your use case? (e.g., education, startup, NGO, etc.)
What is your monthly budget in USD?
What is the internet reliability? (stable, unstable, intermittent)
What is the expected number of users?
Will devices be shared? (yes/no)
What type of data will be handled? (documents, video, real-time, etc.)

Step 2: Architecture Design
Based on the user's responses:
Select ONLY the necessary AWS services
Prefer serverless and cost-efficient architectures
Use AWS Graviton (ARM64) where applicable
Optimize for unreliable or intermittent internet connectivity
Incorporate asynchronous processing and retry mechanisms where needed
Avoid over-provisioning and unnecessary services

Step 3: Deliverables
Generate the following:
1. Architecture Overview
Full AWS architecture description
Data flow explanation
2. Architecture Diagram
Provide a clear text-based diagram illustrating components and interactions
3. Infrastructure as Code
Provide sample implementation using:
AWS CDK (TypeScript) OR
Terraform
Include core resources only (not overly verbose)
4. Deployment Guide
Step-by-step instructions
Include CLI or cdk deploy commands
5. API Design
Define API endpoints
Include sample request and response payloads
6. Cost Estimation
Provide a realistic monthly cost estimate aligned with the user's budget
7. Security Best Practices
IAM roles with least privilege
Encryption at rest and in transit
Secure access patterns
8. Monitoring & Observability
CloudWatch logs, metrics, and alarms
Suggested alerts for failures and cost anomalies

Step 4: Resilience & Optimization
Include strategies for:
Retry mechanisms for failed operations
Handling intermittent or offline-like environments
Queue-based processing using services like SQS when appropriate
Cost optimization techniques
Alternative low-cost service recommendations when applicable

Step 5: Troubleshooting
Provide a section covering common issues and resolutions, including:
IAM permission errors
Deployment failures
Connectivity issues
Unexpected cost increases
Service limits or throttling
Requirements
The solution must be production-ready
It should be clear, actionable, and easy to follow
It must align with AWS Well-Architected Framework principles:
Operational Excellence
Security
Reliability
Performance Efficiency
Cost Optimization
Assume low bandwidth and non-enterprise environments
Prefer free-tier friendly and cost-conscious designs wherever possible
```

## Use Case

This prompt is designed for:

- Developers in emerging markets
- NGOs and education platforms
- Startups with limited budgets
- Builders working in low-connectivity environments

## Prerequisites

- AWS account
- Basic AWS CLI or AWS CDK setup
- IAM permissions for deployment

## Expected Outcome

Users will receive:

- A fully customized AWS architecture based on their constraints
- Deployment-ready instructions (CDK or Terraform)
- Cost-optimized, production-ready infrastructure
- API design with sample requests/responses
- Monitoring, security, and troubleshooting guidance

## AWS Services Used

- **AWS Lambda** – Serverless compute
- **Amazon S3** – Storage
- **Amazon API Gateway** – API layer
- **Amazon DynamoDB** – Database
- **Amazon SQS** – Queue-based processing
- **Amazon CloudWatch** – Monitoring & observability
- **AWS IAM** – Security & access control
- **AWS Graviton** – Cost-efficient ARM64 compute

## Alignment with AWS Well-Architected Framework

### Operational Excellence
- Step-by-step deployment guidance
- Monitoring, logging, and alerting included

### Security
- Least privilege IAM roles
- Encryption in transit and at rest
- Secure access patterns

### Reliability
- Retry logic and async processing
- Queue-based fault tolerance with SQS
- Designed for intermittent connectivity

### Performance Efficiency
- Serverless architecture
- Graviton (ARM64) where applicable
- Scalable components

### Cost Optimization
- Budget-aware design driven by user input
- Free-tier friendly recommendations
- Minimal resource usage, no over-provisioning

## Troubleshooting Tips

- Ensure IAM roles have correct permissions
- Check CloudWatch logs for Lambda and API Gateway errors
- Verify region compatibility for selected services
- Monitor billing dashboard for unexpected cost spikes
- Check service limits and request throttling

## What Makes This Unique

- **Context-aware** – Gathers requirements before designing
- **Built for low-resource environments** – Not another enterprise template
- **Adaptive architecture** – Output changes based on user constraints
- **Production-ready** – Includes IaC, security, monitoring, and cost controls
- **Practical** – Focuses on real-world constraints, not ideal conditions
