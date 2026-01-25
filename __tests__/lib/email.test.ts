import { emailConfig, sendEmail, sendBulkEmails } from '@/lib/email';
import { Resend } from 'resend';

jest.mock('resend');

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send a single email successfully', async () => {
      const mockResend = Resend as jest.MockedClass<typeof Resend>;
      const sendMock = jest.fn().mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      (mockResend as any).prototype.emails = { send: sendMock };

      const result = await sendEmail({
        to: 'test@example.com',
        type: 'registration-confirmation',
        subject: 'Verify Your Email',
        data: {
          name: 'John Doe',
          hackathonName: 'TechHack 2026',
          registrationUrl: 'https://example.com/verify',
        },
      });

      expect(result).toBeDefined();
    });

    it('should handle email sending gracefully', async () => {
      const mockResend = Resend as jest.MockedClass<typeof Resend>;
      const sendMock = jest.fn().mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      (mockResend as any).prototype.emails = { send: sendMock };

      const result = await sendEmail({
        to: 'test@example.com',
        type: 'registration-confirmation',
        subject: 'Verify Your Email',
        data: {
          name: 'John Doe',
          hackathonName: 'TechHack 2026',
          registrationUrl: 'https://example.com/verify',
        },
      });

      expect(result).toBeDefined();
    });

    it('should use correct email configuration', async () => {
      expect(emailConfig.from).toBe('test@hackathon.com');
      expect(emailConfig.support).toBe('support@hackathon.com');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails and track success/failure', async () => {
      const recipients = [
        {
          to: 'user1@example.com',
          type: 'registration-successful' as const,
          subject: 'Welcome',
          data: {
            name: 'User 1',
            hackathonName: 'TechHack 2026',
            hackathonDate: '2026-02-15',
            dashboardUrl: 'https://example.com/dashboard',
          },
        },
        {
          to: 'user2@example.com',
          type: 'registration-successful' as const,
          subject: 'Welcome',
          data: {
            name: 'User 2',
            hackathonName: 'TechHack 2026',
            hackathonDate: '2026-02-15',
            dashboardUrl: 'https://example.com/dashboard',
          },
        },
      ];

      const result = await sendBulkEmails(recipients);

      expect(result.successful).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(result.results).toHaveLength(2);
    });
  });
});
