import { Env } from "@/config/env";
import { dynamoClient } from "@/lib/clients/dynamo";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function* scanLeads() {
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const command = new ScanCommand({
      TableName: Env.leadsTable,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await dynamoClient.send(command);

    lastEvaluatedKey = result.LastEvaluatedKey;

    yield result.Items!;
  } while (lastEvaluatedKey);
}
