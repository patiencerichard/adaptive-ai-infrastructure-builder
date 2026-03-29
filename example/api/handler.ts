import {
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamo = new DynamoDBClient({});
const sqs = new SQSClient({});

const TABLE_NAME = process.env.TABLE_NAME!;
const QUEUE_URL = process.env.QUEUE_URL!;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const { httpMethod, path } = event;

  try {
    if (httpMethod === "POST" && path === "/quiz") {
      return await submitQuiz(event);
    }
    if (httpMethod === "GET" && path === "/progress") {
      return await getProgress(event);
    }
    return response(404, { error: "Not found" });
  } catch (err) {
    console.error("Handler error:", err);
    return response(500, { error: "Internal server error" });
  }
}

// POST /quiz — Send quiz to SQS for async grading
async function submitQuiz(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || "{}");
  const { userId, quizId, answers } = body;

  if (!userId || !quizId || !answers) {
    return response(400, { error: "Missing userId, quizId, or answers" });
  }

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({ userId, quizId, answers }),
    })
  );

  return response(202, { message: "Quiz submitted for grading" });
}

// GET /progress?userId=xxx — Fetch student progress
async function getProgress(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    return response(400, { error: "Missing userId parameter" });
  }

  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": { S: userId } },
    })
  );

  const items = (result.Items || []).map((item) => ({
    quizId: item.quizId.S,
    score: Number(item.score.N),
    submittedAt: item.submittedAt.S,
  }));

  return response(200, { userId, progress: items });
}

function response(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
