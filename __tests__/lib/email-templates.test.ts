import { EmailTemplate } from '@/lib/email-templates';

describe('Email Templates', () => {
  describe('Registration Templates', () => {
    it('should generate registration confirmation email', () => {
      const html = EmailTemplate.getTemplate('registration-confirmation', {
        name: 'John Doe',
        hackathonName: 'TechHack 2026',
        registrationUrl: 'https://example.com/verify',
      });

      expect(html).toContain('John Doe');
      expect(html).toContain('TechHack 2026');
      expect(html).toContain('https://example.com/verify');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should generate registration successful email', () => {
      const html = EmailTemplate.getTemplate('registration-successful', {
        name: 'Jane Smith',
        hackathonName: 'WebHack 2026',
        hackathonDate: '2026-03-20',
        dashboardUrl: 'https://example.com/dashboard',
      });

      expect(html).toContain('Jane Smith');
      expect(html).toContain('WebHack 2026');
      expect(html).toContain('2026-03-20');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });

  describe('Team & Submission Templates', () => {
    it('should generate team invitation email', () => {
      const html = EmailTemplate.getTemplate('team-invitation', {
        inviterName: 'Alice Johnson',
        teamName: 'Code Warriors',
        hackathonName: 'TechHack 2026',
        acceptUrl: 'https://example.com/accept-invite',
      });

      expect(html).toContain('Code Warriors');
      expect(html).toContain('TechHack 2026');
      expect(html).toContain('https://example.com/accept-invite');
    });

    it('should generate submission received email', () => {
      const html = EmailTemplate.getTemplate('submission-received', {
        name: 'Bob Wilson',
        hackathonName: 'TechHack 2026',
        projectTitle: 'AI Chat Assistant',
        submissionUrl: 'https://example.com/submission/123',
      });

      expect(html).toContain('Bob Wilson');
      expect(html).toContain('AI Chat Assistant');
      expect(html).toContain('Submission Received');
    });
  });

  describe('Scoring & Award Templates', () => {
    it('should generate score notification email', () => {
      const html = EmailTemplate.getTemplate('score-notification', {
        name: 'Carol Davis',
        hackathonName: 'TechHack 2026',
        projectTitle: 'ML Pipeline',
        score: 87,
        feedback: 'Great innovation and technical depth!',
        leaderboardUrl: 'https://example.com/leaderboard',
      });

      expect(html).toContain('Carol Davis');
      expect(html).toContain('87');
      expect(html).toContain('Great innovation and technical depth!');
    });

    it('should generate winner announcement email', () => {
      const html = EmailTemplate.getTemplate('winner-announcement', {
        name: 'David Chen',
        hackathonName: 'TechHack 2026',
        prize: '1st Place - $5000',
        ceremonyDate: '2026-03-25',
        ceremonyUrl: 'https://example.com/ceremony',
      });

      expect(html).toContain('Congratulations');
      expect(html).toContain('1st Place - $5000');
      expect(html).toContain('2026-03-25');
    });
  });

  describe('Reminder & Announcement Templates', () => {
    it('should generate deadline reminder email', () => {
      const html = EmailTemplate.getTemplate('deadline-reminder', {
        name: 'Emma Miller',
        hackathonName: 'TechHack 2026',
        eventType: 'submission',
        hoursUntil: 12,
        actionUrl: 'https://example.com/submit',
      });

      expect(html).toContain('Emma Miller');
      expect(html).toContain('12 hours');
      expect(html).toContain('submission');
    });

    it('should generate urgent reminder for very soon deadlines', () => {
      const html = EmailTemplate.getTemplate('deadline-reminder', {
        name: 'Frank Roberts',
        hackathonName: 'TechHack 2026',
        eventType: 'registration',
        hoursUntil: 2,
        actionUrl: 'https://example.com/register',
      });

      expect(html).toContain('Urgent');
      expect(html).toContain('2 hours');
    });

    it('should generate announcement email', () => {
      const html = EmailTemplate.getTemplate('hackathon-announcement', {
        hackathonName: 'TechHack 2026',
        title: 'Judging Schedule Released',
        message: 'The final judging session is scheduled for March 25th at 2 PM IST.',
        actionUrl: 'https://example.com/schedule',
        actionText: 'View Schedule',
      });

      expect(html).toContain('Judging Schedule Released');
      expect(html).toContain('March 25th');
      expect(html).toContain('View Schedule');
    });
  });

  describe('Template Structure', () => {
    it('should include proper HTML structure', () => {
      const html = EmailTemplate.getTemplate('registration-confirmation', {
        name: 'Test User',
        hackathonName: 'Test Hackathon',
        registrationUrl: 'https://example.com',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
      expect(html).toContain('.email-container');
    });

    it('should include email branding and footer', () => {
      const html = EmailTemplate.getTemplate('submission-received', {
        name: 'Test User',
        hackathonName: 'Test Hackathon',
        projectTitle: 'Test Project',
        submissionUrl: 'https://example.com',
      });

      expect(html).toContain('Hackathon Platform');
      expect(html).toContain('© 2026');
      expect(html).toContain('Unsubscribe');
    });

    it('should have responsive CSS styling', () => {
      const html = EmailTemplate.getTemplate('registration-successful', {
        name: 'Test User',
        hackathonName: 'Test Hackathon',
        hackathonDate: '2026-03-20',
        dashboardUrl: 'https://example.com',
      });

      expect(html).toContain('max-width: 600px');
      expect(html).toContain('font-family');
      expect(html).toContain('background');
    });
  });

  describe('Default Template', () => {
    it('should handle unknown email types', () => {
      const html = EmailTemplate.getTemplate('unknown-type', {
        message: 'This is a test',
      });

      expect(html).toContain('Notification');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
});
