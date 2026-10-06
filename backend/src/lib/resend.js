import { Resend } from "resend";
import { ENV } from "./env.js";

export const createResendClient = () => {
  if (!ENV.RESEND_API_KEY) {
    throw new Error("EMAIL_PROVIDER is resend, but RESEND_API_KEY is not configured");
  }

  return new Resend(ENV.RESEND_API_KEY);
};
