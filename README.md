# Adaptive AWS Architecture Builder for Low-Resource Environments

A prompt for designing production-ready AWS architectures based on real-world constraints.

## What this is

Most AWS deployment prompts assume enterprise budgets, stable internet, and dedicated devices. This prompt doesn't. It asks about your constraints first, then designs an architecture that fits.

## Prompt Structure

```
adaptive-ai-infrastructure-builder/
├── PROMPT.md                    # Core prompt
├── GUIDE.md                     # Complete usage guide (start here)
├── references/
│   ├── services.md              # AWS services decision matrix
│   ├── architecture-patterns.md # Common architecture patterns
│   └── examples.md              # Sample scenarios and outputs
├── example/                     # Working example project (CDK + Lambda)
├── CHANGELOG.md
├── README.md
└── LICENSE
```

## Quick start

1. Copy the prompt from [`PROMPT.md`](PROMPT.md)
2. Paste it into your AI assistant (Kiro, Amazon Q, ChatGPT, etc.)
3. Answer 6 questions about your situation
4. Get a full deployable architecture
5. Run `cdk deploy`

📖 **New here?** Read the **[Complete Guide](GUIDE.md)** — it walks you through everything from setup to deployment to testing.

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

## Example Project

See [`example/`](example/) for a complete working project generated from this prompt — an NGO education platform for rural Tanzania ($30/mo budget, intermittent connectivity, 200 students, shared devices).

Includes CDK stack, Lambda handlers, architecture diagram, and cost estimate.

## Author

[Patience Richard](https://github.com/patiencerichard)

## License

MIT. Use freely, share widely.
