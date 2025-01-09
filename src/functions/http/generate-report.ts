import { Env } from "@/config/env";
import { sqsClient } from "@/lib/clients/sqs";
import { parseBody } from "@/lib/utils/request";
import { response } from "@/lib/utils/response";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyEventV2 } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2) {
  const data = parseBody<{ userId: string }>(event);

  const sendMessageCommand = new SendMessageCommand({
    QueueUrl: Env.generateReportQueueurl,
    MessageBody: JSON.stringify({
      userId: data.userId,
      requestedAt: new Date().toISOString(),
    }),
  });

  await sqsClient.send(sendMessageCommand);

  return response(200);
}
