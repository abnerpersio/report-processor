import { response } from "@/lib/utils/response";

export async function handler() {
  const total = 2_000;

  const promises = Array.from({ length: total }, async () => {
    // const putCommand = new PutCommand({
    //   TableName: Env.leadsTable,
    //   Item: {
    //     id: randomUUID(),
    //     name: faker.person.fullName(),
    //     email: faker.internet
    //       .email({ allowSpecialCharacters: false })
    //       .toLowerCase(),
    //     jobTitle: faker.person.jobTitle(),
    //   },
    // });
    // await dynamoClient.send(putCommand);
  });

  const result = await Promise.allSettled(promises);

  return response(201, {
    totalCreatedLeads: result.filter(
      (promise) => promise.status === "fulfilled"
    ).length,
  });
}
