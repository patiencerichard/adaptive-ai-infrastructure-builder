# Project Rules

- Always ask the 6 requirement gathering questions before designing any architecture
- Never assume enterprise budgets or stable internet
- Prefer serverless services (Lambda, DynamoDB on-demand, SQS) over provisioned resources
- Use AWS Graviton (ARM64) for any compute that needs EC2
- Always include cost estimation in every architecture
- Always include IAM least privilege policies
- Always include CloudWatch monitoring and alarms
- Use SQS for async processing when internet is intermittent
- Reference files in `references/` for service selection and architecture patterns
- Generate CDK TypeScript by default unless user requests Terraform
