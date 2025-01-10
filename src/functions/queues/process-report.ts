import { Env } from "@/config/env";
import { getPaginatedLeads } from "@/db/get-paginated-leads";
import { getPresignedUrl } from "@/lib/clients/get-presigned-url";
import { sendEmail } from "@/lib/clients/resend";
import { getByteLength, mbToBytes } from "@/lib/utils/mb-to-bytes";
import { S3MPUManager } from "@/services/S3MPUManager";
import type { SQSEvent } from "aws-lambda";

const minChunkSize = mbToBytes(6);

const mountRow = (lead: Record<string, any>) =>
  [lead.id, lead.name, lead.email, lead.jobTitle].join(",");

export async function handler(event: SQSEvent) {
  const data = JSON.parse(event.Records?.[0]?.body ?? "{}");

  const requester = data.userId ?? "system";
  const fileKey = `leads-${new Date().toISOString()}-${requester}.csv`;

  const mpu = new S3MPUManager(Env.reportsBucketName, fileKey);
  await mpu.start();

  try {
    const header = "Id,Nome,E-mail,Cargo\n";
    let currentFile = header;
    let isMultipart = false;

    const paginator = getPaginatedLeads();

    for await (const { Items: leads = [] } of paginator) {
      currentFile += leads.map((lead) => `${mountRow(lead)}\n`).join("");

      const currentFileSize = getByteLength(currentFile);

      if (currentFileSize < minChunkSize) {
        continue;
      }

      isMultipart = true;
      await mpu.uploadPart(Buffer.from(currentFile, "utf-8"));
      currentFile = "";
    }

    if (isMultipart && !!currentFile) {
      await mpu.uploadPart(Buffer.from(currentFile, "utf-8"));
    }

    if (!isMultipart && !!currentFile) {
      // TODO: handle default upload to S3
    }

    await mpu.complete();
  } catch {
    await mpu.abort();
  }

  const presignedUrl = await getPresignedUrl({
    bucket: Env.reportsBucketName,
    fileKey,
  });

  await sendEmail({
    to: ["delivered@resend.dev"],
    subject: "Relatório solicitado",
    text: `** Receba teu arquivo ai papai
        ------------------------------------------------------------
        URL válida por apenas 24 horas\n\n

        Clique aqui na URL (${presignedUrl}) \n Ou copie e cole no navegador \n ${presignedUrl}`,
    html: `<div>
      <h1>Receba teu arquivo ai papai</h1>
      <span style={{ color: "red"; }}>URL válida por apenas 24horas</span>

      <a href="${presignedUrl}" target="_blank">Clique aqui na URL</a>

      Ou copie essa URL e cole no navegador

      <span style={{ color: "blue" }}>${presignedUrl}</span>
    </div>`,
  });
}
