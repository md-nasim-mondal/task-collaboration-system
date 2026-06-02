import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { emailTemplates, TEmailTemplateName } from "./emailTemplates";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: TEmailTemplateName;
  templateData?: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templateFn = emailTemplates[templateName];
    if (!templateFn) {
      throw new AppError(404, `Template ${templateName} not found`);
    }

    // Call the template function with data
    let html = "";
    if (templateName === "forgetPassword" && templateData) {
      html = (templateFn as (name: string, link: string, code: string) => string)(
        templateData.name as string,
        templateData.resetUILink as string,
        templateData.code as string
      );
    } else if (templateName === "verifyEmail" && templateData) {
      html = (templateFn as (name: string, code: string) => string)(
        templateData.name as string,
        templateData.code as string
      );
    } else if (templateName === "otp" && templateData) {
      html = (templateFn as (name: string, otp: string) => string)(
        templateData.name as string,
        templateData.otp as string
      );
    } else if (templateName === "invoice" && templateData) {
      html = (templateFn as (name: string, amount: string, id: string) => string)(
        templateData.name as string,
        templateData.amount as string,
        templateData.paymentId as string
      );
    } else {
      html = (templateFn as () => string)();
    }

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FORM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.log("email sending error: ", err.message);
    throw new AppError(401, "Email Error!");
  }
};
