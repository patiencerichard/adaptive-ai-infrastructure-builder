# School Information System — AWS Infrastructure

**Region:** af-south-1 (Cape Town) · **Budget:** ~$10/mo · **Users:** 300

## Architecture

```
Browser → CloudFront → S3 (frontend)
Browser → API Gateway (Cognito auth) → Lambda → DynamoDB
                                              └→ S3 (documents)
```

## Setup & Deploy

```bash
# 1. Install CDK dependencies
npm install

# 2. Install Lambda dependencies
cd lambda && npm install && cd ..

# 3. Bootstrap CDK (first time only)
cdk bootstrap aws://YOUR_ACCOUNT_ID/af-south-1

# 4. Deploy
cdk deploy
```

After deploy, note the outputs:
- `ApiUrl` — your REST API endpoint
- `UserPoolId` + `UserPoolClientId` — for frontend auth config

## Create First Admin User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@school.tz \
  --temporary-password Temp1234 \
  --region af-south-1

aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@school.tz \
  --group-name Admin \
  --region af-south-1
```

## API Reference

All endpoints require `Authorization: Bearer <cognito_token>` header.

| Method | Path | Description |
|--------|------|-------------|
| POST | /students | Create student |
| GET | /students?classId=X | List students by class |
| GET | /students/{id} | Get student profile |
| PUT | /students/{id} | Update student |
| POST | /grades | Record grade |
| GET | /grades?studentId=X | Get student grades |
| POST | /attendance | Record attendance |
| GET | /attendance?studentId=X | Get attendance history |
| POST | /fees | Create fee record |
| GET | /fees?studentId=X | Get fee records |
| PUT | /fees/{studentId} | Record payment |
| POST | /documents | Get presigned upload URL |
| GET | /documents/{id}?key=X | Get presigned download URL |
| GET | /reports/{studentId} | Full student report |

## DynamoDB Key Design

```
PK                    SK                         Data
STUDENT#<id>          PROFILE                    name, classId, dob, guardian
STUDENT#<id>          GRADE#<term>#<subject>     score, grade
STUDENT#<id>          ATTENDANCE#<date>          status
STUDENT#<id>          FEE#<term>                 amount, paid, balance
STUDENT#<id>          DOC#<timestamp>            key, filename
```

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access, create users, delete records |
| Teacher | Read/write grades, attendance, reports |
| Parent | Read-only student profile, fees, reports |
