import { Resend } from 'resend';
import { EmailTemplate } from '@/lib/email-templates';

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@hackathon.com',
  support: process.env.EMAIL_SUPPORT || 'support@hackathon.com',
};

export type EmailType = 
  | 'registration-confirmation'
  | 'registration-successful'
  | 'team-invitation'
  | 'submission-received'
  | 'score-notification'
  | 'winner-announcement'
  | 'deadline-reminder'
  | 'hackathon-announcement';

export interface SendEmailParams {
  to: string | string[];
  type: EmailType;
  subject: string;
  data: Record<string, any>;
}

/**
 * Send email using Resend
 * @param params Email configuration and data
 * @returns Email send result
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    const { to, type, subject, data } = params;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(`[Email Warn] RESEND_API_KEY missing. Skipping send for type=${type} to=${to}.`);
      return { data: { id: 'skipped-no-api-key' } } as any;
    }

    const resend = new Resend(apiKey);

    // Get email template
    const template = EmailTemplate.getTemplate(type, data);

    // Send email
    const result = await resend.emails.send({
      from: emailConfig.from,
      to: typeof to === 'string' ? to : to[0],
      bcc: typeof to === 'string' ? [] : to.slice(1),
      subject,
      html: template,
      replyTo: emailConfig.support,
    });

    // Log success
    if (result.error) {
      console.error(`[Email Error] Failed to send ${type} email to ${to}:`, result.error);
      throw new Error(`Email delivery failed: ${result.error.message}`);
    }

    console.log(`[Email Success] ${type} email sent to ${to}. ID: ${result.data?.id}`);
    return result;
  } catch (error) {
    console.error('[Email Error]', error);
    throw error;
  }
}

/**
 * Send bulk emails
 * @param recipients Array of recipient configs
 */
export async function sendBulkEmails(
  recipients: SendEmailParams[]
) {
  const results = await Promise.allSettled(
    recipients.map((recipient) => sendEmail(recipient))
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  console.log(`[Email Bulk] Sent ${successful}/${recipients.length} emails. Failed: ${failed}`);

  return { successful, failed, results };
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    registrationUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'registration-confirmation',
    subject: `Verify your registration for ${data.hackathonName}`,
    data,
  });
}

/**
 * Send successful registration email
 */
export async function sendRegistrationSuccessful(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    hackathonDate: string;
    dashboardUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'registration-successful',
    subject: `Welcome to ${data.hackathonName}!`,
    data,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitation(
  email: string,
  data: {
    inviterName: string;
    teamName: string;
    hackathonName: string;
    acceptUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'team-invitation',
    subject: `Join team "${data.teamName}" for ${data.hackathonName}`,
    data,
  });
}

/**
 * Send submission received email
 */
export async function sendSubmissionReceived(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    projectTitle: string;
    submissionUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'submission-received',
    subject: `Submission received for ${data.hackathonName}`,
    data,
  });
}

/**
 * Send score notification email
 */
export async function sendScoreNotification(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    projectTitle: string;
    score: number;
    feedback?: string;
    leaderboardUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'score-notification',
    subject: `Your project was scored - ${data.hackathonName}`,
    data,
  });
}

/**
 * Send winner announcement email
 */
export async function sendWinnerAnnouncement(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    prize: string;
    ceremonyDate: string;
    ceremonyUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'winner-announcement',
    subject: `🎉 You won ${data.prize} at ${data.hackathonName}!`,
    data,
  });
}

/**
 * Send deadline reminder email
 */
export async function sendDeadlineReminder(
  email: string,
  data: {
    name: string;
    hackathonName: string;
    eventType: string; // 'registration' | 'submission'
    hoursUntil: number;
    actionUrl: string;
  }
) {
  return sendEmail({
    to: email,
    type: 'deadline-reminder',
    subject: `⏰ ${data.eventType} deadline in ${data.hoursUntil} hours - ${data.hackathonName}`,
    data,
  });
}

/**
 * Send announcement email
 */
export async function sendAnnouncementEmail(
  emails: string[],
  data: {
    hackathonName: string;
    title: string;
    message: string;
    actionUrl: string;
    actionText: string;
  }
) {
  return sendEmail({
    to: emails,
    type: 'hackathon-announcement',
    subject: `${data.hackathonName}: ${data.title}`,
    data,
  });
}

export default {
  sendEmail,
  sendBulkEmails,
  sendRegistrationConfirmation,
  sendRegistrationSuccessful,
  sendTeamInvitation,
  sendSubmissionReceived,
  sendScoreNotification,
  sendWinnerAnnouncement,
  sendDeadlineReminder,
  sendAnnouncementEmail,
};
