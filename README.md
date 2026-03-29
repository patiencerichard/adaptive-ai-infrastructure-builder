# Adaptive AWS Architecture Builder for Low-Resource Environments

A prompt for designing production-ready AWS architectures based on real-world constraints.

## What this is

Most AWS deployment prompts assume enterprise budgets, stable internet, and dedicated devices. This prompt doesn't. It asks about your constraints first, then designs an architecture that fits.

## Prompt Structure

```
adaptive-ai-infrastructure-builder/
├── PROMPT.md                    # Core prompt
├── references/
│   ├── services.md              # AWS services decision matrix
│   ├── architecture-patterns.md # Common architecture patterns
│   └── examples.md              # Sample scenarios and outputs
├── CHANGELOG.md
├── README.md
└── LICENSE
```

## Quick start

**Any AI assistant:** Copy the prompt from `PROMPT.md` and paste it into your conversation.

**Claude Projects:** Upload `PROMPT.md` and reference files to project knowledge.

**API calls:** Include `PROMPT.md` in your system prompt. Reference files load on demand.

## What it does

1. **Gathers context** — Asks about use case, budget, connectivity, users, devices, data type
2. **Designs architecture** — Selects only necessary AWS services, optimized for constraints
3. **Delivers everything** — IaC (CDK/Terraform), API design, cost estimate, security, monitoring, troubleshooting

## Who it's for

- Developers in emerging markets
- NGOs and education platforms
- Budget-limited startups
- Builders in low-connectivity environments

## AWS Services

Lambda · S3 · API Gateway · DynamoDB · SQS · CloudWatch · IAM · Graviton

## Author

[Patience Richard](https://github.com/patiencerichard)

## License

MIT. Use freely, share widely.
