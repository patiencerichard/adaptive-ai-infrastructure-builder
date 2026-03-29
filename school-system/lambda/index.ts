import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE = process.env.TABLE_NAME!;
const BUCKET = process.env.BUCKET_NAME!;

const ok = (body: unknown) => ({ statusCode: 200, headers: cors(), body: JSON.stringify(body) });
const err = (code: number, msg: string) => ({ statusCode: code, headers: cors(), body: JSON.stringify({ error: msg }) });
const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, resource, pathParameters, body } = event;
  const id = pathParameters?.id;
  const data = body ? JSON.parse(body) : {};
  const groups: string[] = event.requestContext.authorizer?.claims?.['cognito:groups']?.split(',') ?? [];

  try {
    // ── STUDENTS ──────────────────────────────────────────────────────
    if (resource?.startsWith('/students')) {
      if (httpMethod === 'POST') {
        const studentId = uuid();
        await db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `STUDENT#${studentId}`, SK: 'PROFILE', ...data, studentId,
                  GSI1PK: `CLASS#${data.classId}`, GSI1SK: `STUDENT#${studentId}` },
        }));
        return ok({ studentId });
      }
      if (httpMethod === 'GET' && !id) {
        const res = await db.send(new QueryCommand({
          TableName: TABLE, IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :pk',
          ExpressionAttributeValues: { ':pk': `CLASS#${event.queryStringParameters?.classId ?? ''}` },
        }));
        return ok(res.Items);
      }
      if (httpMethod === 'GET' && id) {
        const res = await db.send(new GetCommand({ TableName: TABLE, Key: { PK: `STUDENT#${id}`, SK: 'PROFILE' } }));
        return res.Item ? ok(res.Item) : err(404, 'Student not found');
      }
      if (httpMethod === 'PUT' && id) {
        await db.send(new UpdateCommand({
          TableName: TABLE, Key: { PK: `STUDENT#${id}`, SK: 'PROFILE' },
          UpdateExpression: 'SET #n = :n, classId = :c',
          ExpressionAttributeNames: { '#n': 'name' },
          ExpressionAttributeValues: { ':n': data.name, ':c': data.classId },
        }));
        return ok({ updated: true });
      }
      if (httpMethod === 'DELETE' && id) {
        if (!groups.includes('Admin')) return err(403, 'Forbidden');
        await db.send(new DeleteCommand({ TableName: TABLE, Key: { PK: `STUDENT#${id}`, SK: 'PROFILE' } }));
        return ok({ deleted: true });
      }
    }

    // ── GRADES ────────────────────────────────────────────────────────
    if (resource?.startsWith('/grades')) {
      if (httpMethod === 'POST') {
        await db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `STUDENT#${data.studentId}`, SK: `GRADE#${data.term}#${data.subject}`, ...data },
        }));
        return ok({ saved: true });
      }
      if (httpMethod === 'GET') {
        const studentId = id ?? event.queryStringParameters?.studentId;
        const res = await db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'GRADE#' },
        }));
        return ok(res.Items);
      }
    }

    // ── ATTENDANCE ────────────────────────────────────────────────────
    if (resource?.startsWith('/attendance')) {
      if (httpMethod === 'POST') {
        await db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `STUDENT#${data.studentId}`, SK: `ATTENDANCE#${data.date}`, status: data.status },
        }));
        return ok({ saved: true });
      }
      if (httpMethod === 'GET') {
        const studentId = id ?? event.queryStringParameters?.studentId;
        const res = await db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'ATTENDANCE#' },
        }));
        return ok(res.Items);
      }
    }

    // ── FEES ──────────────────────────────────────────────────────────
    if (resource?.startsWith('/fees')) {
      if (httpMethod === 'POST') {
        await db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `STUDENT#${data.studentId}`, SK: `FEE#${data.term}`, ...data },
        }));
        return ok({ saved: true });
      }
      if (httpMethod === 'GET') {
        const studentId = id ?? event.queryStringParameters?.studentId;
        const res = await db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'FEE#' },
        }));
        return ok(res.Items);
      }
      if (httpMethod === 'PUT' && id) {
        // Record a payment
        await db.send(new UpdateCommand({
          TableName: TABLE,
          Key: { PK: `STUDENT#${id}`, SK: `FEE#${data.term}` },
          UpdateExpression: 'SET paid = :p, balance = :b, paidDate = :d',
          ExpressionAttributeValues: { ':p': data.paid, ':b': data.balance, ':d': new Date().toISOString() },
        }));
        return ok({ updated: true });
      }
    }

    // ── DOCUMENTS ─────────────────────────────────────────────────────
    if (resource?.startsWith('/documents')) {
      if (httpMethod === 'POST') {
        // Return presigned upload URL
        const key = `documents/${data.studentId}/${uuid()}-${data.filename}`;
        const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: data.contentType }), { expiresIn: 300 });
        await db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `STUDENT#${data.studentId}`, SK: `DOC#${Date.now()}`, key, filename: data.filename },
        }));
        return ok({ uploadUrl: url, key });
      }
      if (httpMethod === 'GET' && id) {
        // Return presigned download URL
        const key = event.queryStringParameters?.key!;
        const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 300 });
        return ok({ downloadUrl: url });
      }
    }

    // ── REPORTS ───────────────────────────────────────────────────────
    if (resource?.startsWith('/reports')) {
      if (httpMethod === 'GET') {
        const studentId = id ?? event.queryStringParameters?.studentId;
        const [grades, attendance, fees] = await Promise.all([
          db.send(new QueryCommand({ TableName: TABLE, KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)', ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'GRADE#' } })),
          db.send(new QueryCommand({ TableName: TABLE, KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)', ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'ATTENDANCE#' } })),
          db.send(new QueryCommand({ TableName: TABLE, KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)', ExpressionAttributeValues: { ':pk': `STUDENT#${studentId}`, ':sk': 'FEE#' } })),
        ]);
        return ok({ studentId, grades: grades.Items, attendance: attendance.Items, fees: fees.Items });
      }
    }

    return err(404, 'Route not found');
  } catch (e: any) {
    console.error(e);
    return err(500, e.message);
  }
};
