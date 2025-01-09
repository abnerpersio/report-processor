import { Env } from "@/config/env";
import { Resend } from "resend";

const resend = new Resend(Env.resendAPIKey);

type Params = {
  from?: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail({ from, to, subject, text, html }: Params) {
  await resend.emails.send({
    from: from ?? "onboarding@resend.dev",
    to,
    subject,
    text,
    html,
  });
}
