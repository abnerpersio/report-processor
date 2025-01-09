import type { APIGatewayProxyEventV2 } from "aws-lambda";

export function parseBody<TData>(event: APIGatewayProxyEventV2) {
  try {
    return JSON.parse(event.body ?? "{}") as TData;
  } catch {
    return {} as TData;
  }
}
