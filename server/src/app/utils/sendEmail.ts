import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { emailTemplates, TEmailTemplateName } from "./emailTemplates";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;
  if (
    envVars.EMAIL_SENDER &&
    envVars.EMAIL_SENDER.SMTP_HOST &&
    envVars.EMAIL_SENDER.SMTP_PORT &&
    envVars.EMAIL_SENDER.SMTP_USER &&
    envVars.EMAIL_SENDER.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: envVars.EMAIL_SENDER.SMTP_HOST,
      port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
      secure: envVars.EMAIL_SENDER.SMTP_PORT === "465",
      auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
      },
    });
    return transporter;
  }
  return null;
};

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
}: SendEmailOptions): Promise<void> => {
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

    const activeTransporter = getTransporter();
    if (!activeTransporter) {
      console.log(`\n📧 ======== [CONSOLE EMAIL FALLBACK] ========`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      if (templateData && templateData.code) {
        console.log(`OTP Code: ${templateData.code}`);
      }
      if (templateData && templateData.otp) {
        console.log(`OTP Code: ${templateData.otp}`);
      }
      console.log(`===========================================\n`);
      return;
    }

    const info = await activeTransporter.sendMail({
      from: envVars.EMAIL_SENDER?.SMTP_FORM || `"CollabSphere" <no-reply@collabsphere.com>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.log("email sending error: ", err.message);
    throw new AppError(401, "Email Error!");
  }
};
