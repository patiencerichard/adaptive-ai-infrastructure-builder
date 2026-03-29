import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent } from "aws-lambda";

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

// Answer keys per quiz — in production, store these in DynamoDB or S3
const ANSWER_KEYS: Record<string, string[]> = {
  "quiz-001": ["A", "C", "B", "D", "A"],
  "quiz-002": ["B", "A", "D", "C", "B"],
};

export async function handler(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    const { userId, quizId, answers } = JSON.parse(record.body);

    const key = ANSWER_KEYS[quizId];
    if (!key) {
      console.error(`No answer key for quiz: ${quizId}`);
      continue;
    }

    const correct = answers.filter(
      (a: string, i: number) => a === key[i]
    ).length;
    const score = Math.round((correct / key.length) * 100);

    await dynamo.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          userId: { S: userId },
          quizId: { S: quizId },
          score: { N: String(score) },
          totalQuestions: { N: String(key.length) },
          correctAnswers: { N: String(correct) },
          submittedAt: { S: new Date().toISOString() },
        },
      })
    );

    console.log(`Graded ${quizId} for ${userId}: ${score}%`);
  }
}
