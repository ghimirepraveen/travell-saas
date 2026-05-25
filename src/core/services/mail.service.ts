import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { envConfig } from "../config/env.config";
import { logger } from "../utils/logger.util";

// TODO later this will be replaced by db inserting the email template and sending the email via the db.

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string | string[];
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  const { mail } = envConfig;
  if (!mail.enabled) {
    return null;
  }
  if (!mail.host) {
    logger.warn("Mail is enabled but MAIL_HOST is empty; skipping SMTP setup");
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth:
        mail.user && mail.password
          ? {
              user: mail.user,
              pass: mail.password,
            }
          : undefined,
    });
  }
  return transporter;
};

/** True when MAIL_ENABLED is not false and MAIL_HOST is set. */
export const isMailConfigured = (): boolean => {
  const { mail } = envConfig;
  return mail.enabled && Boolean(mail.host);
};

/**
 * Sends an email via SMTP. If mail is not configured, logs and returns without throwing
 * (safe for dev / tests).
 */
export const sendMail = async (
  options: SendMailOptions,
): Promise<{ sent: boolean; messageId?: string }> => {
  const transport = getTransporter();
  if (!transport) {
    logger.debug("Mail skipped (not configured)", {
      to: options.to,
      subject: options.subject,
    });
    return { sent: false };
  }

  const { mail } = envConfig;
  const from = mail.from;

  try {
    const info = await transport.sendMail({
      from,
      to: options.to,
      cc: options.cc,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    logger.info("Mail sent", { messageId: info.messageId, to: options.to });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Mail send failed", {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** Onboarding email for the first owner when a tenant is created. */
export const sendOwnerOnboardingEmail = async (params: {
  to: string;
  fullName?: string | null;
  agencyName: string;
  loginUrl: string;
  email: string;
  temporaryPassword: string;
}): Promise<{ sent: boolean }> => {
  const name = params.fullName?.trim() || "there";
  const subject = `Your ${params.agencyName} account is ready`;
  const text = [
    `Hi ${name},`,
    "",
    `Your travel agency workspace "${params.agencyName}" has been created.`,
    "",
    `Sign in here: ${params.loginUrl}`,
    `Email: ${params.email}`,
    `Password: ${params.temporaryPassword}`,
    "",
    "Please change your password after your first login.",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your workspace <strong>${escapeHtml(params.agencyName)}</strong> is ready.</p>
    <p><a href="${escapeHtml(params.loginUrl)}">Sign in to your dashboard</a></p>
    <ul>
      <li><strong>Email:</strong> ${escapeHtml(params.email)}</li>
      <li><strong>Password:</strong> ${escapeHtml(params.temporaryPassword)}</li>
    </ul>
    <p>Please change your password after your first login.</p>
  `;

  return sendMail({ to: params.to, subject, text, html });
};

/** Notify staff created by an owner/admin (no password in email — set by admin). */
export const sendStaffInviteEmail = async (params: {
  to: string;
  fullName?: string | null;
  agencyName: string;
  loginUrl: string;
}): Promise<{ sent: boolean }> => {
  const name = params.fullName?.trim() || "there";
  const subject = `You have been added to ${params.agencyName}`;
  const text = `Hi ${name},\n\nAn account was created for you at ${params.agencyName}.\n\nSign in: ${params.loginUrl}\n\nUse the email and password provided by your administrator.`;
  const html = `<p>Hi ${escapeHtml(name)},</p><p>You have been added to <strong>${escapeHtml(params.agencyName)}</strong>.</p><p><a href="${escapeHtml(params.loginUrl)}">Sign in</a></p><p>Use the email and password from your administrator.</p>`;
  return sendMail({ to: params.to, subject, text, html });
};

/** @deprecated use sendStaffInviteEmail */
export const sendStaffWelcomeEmail = sendStaffInviteEmail;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
