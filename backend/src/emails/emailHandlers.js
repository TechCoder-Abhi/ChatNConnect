import { ENV } from "../lib/env.js";
import { createResendClient } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const provider = ENV.EMAIL_PROVIDER.toLowerCase();
  if (provider === "disabled") {
    console.log("Welcome email skipped because EMAIL_PROVIDER is disabled");
    return { sent: false, reason: "disabled" };
  }

  const senderEmail = ENV.EMAIL_FROM;
  if (!senderEmail) throw new Error("EMAIL_FROM must be configured when email is enabled");

  const from = ENV.EMAIL_FROM_NAME
    ? `${ENV.EMAIL_FROM_NAME} <${senderEmail}>`
    : senderEmail;
  const message = {
    from,
    to: email,
    subject: "Welcome to ChatNConnect!",
    html: createWelcomeEmailTemplate(name, clientURL),
  };

  if (provider === "resend") {
    const { data, error } = await createResendClient().emails.send(message);
    if (error) throw new Error(`Resend failed: ${error.message}`);
    console.log("Welcome email sent via Resend", data?.id);
    return { sent: true, provider };
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}. Use disabled or resend.`);
};
