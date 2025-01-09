import type { SQSEvent } from "aws-lambda";

export async function handler(event: SQSEvent) {
  const data = event.Records[0];

  console.log("data", data);
}
