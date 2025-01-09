import { Env } from "@/config/env";
import { dynamoClient } from "@/lib/clients/dynamo";
import { paginateScan } from "@aws-sdk/lib-dynamodb";

export function getPaginatedLeads() {
  return paginateScan({ client: dynamoClient }, { TableName: Env.leadsTable });
}
