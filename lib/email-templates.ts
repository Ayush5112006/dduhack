/**
 * Email Template Builder
 * Creates HTML email templates for different notification types
 */

export class EmailTemplate {
  static getTemplate(type: string, data: Record<string, any>): string {
    switch (type) {
      case 'registration-confirmation':
        return this.registrationConfirmation(data);
      case 'registration-successful':
        return this.registrationSuccessful(data);
      case 'team-invitation':
        return this.teamInvitation(data);
      case 'submission-received':
        return this.submissionReceived(data);
      case 'score-notification':
        return this.scoreNotification(data);
      case 'winner-announcement':
        return this.winnerAnnouncement(data);
      case 'deadline-reminder':
        return this.deadlineReminder(data);
      case 'hackathon-announcement':
        return this.hackathonAnnouncement(data);
      default:
        return this.defaultTemplate(data);
    }
  }

  static baseTemplate(content: string, subject: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px;
          }
          .content h2 {
            color: #667eea;
            font-size: 22px;
            margin-top: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
          }
          .divider {
            height: 1px;
            background-color: #eee;
            margin: 30px 0;
          }
          .info-box {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .badge {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎯 Hackathon Platform</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© 2026 Hackathon Platform. All rights reserved.</p>
            <p>You received this email because you're registered on our platform.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static registrationConfirmation(data: Record<string, any>): string {
    const content = `
      <h2>Welcome, ${data.name}! 👋</h2>
      <p>Thank you for registering for <strong>${data.hackathonName}</strong>!</p>
      <p>Please verify your email to complete your registration:</p>
      <a href="${data.registrationUrl}" class="cta-button">Verify Email</a>
      <p>If you didn't register for this hackathon, you can safely ignore this email.</p>
    `;
    return this.baseTemplate(content, 'Email Verification Required');
  }

  static registrationSuccessful(data: Record<string, any>): string {
    const content = `
      <h2>Registration Confirmed! 🎉</h2>
      <p>Hi ${data.name},</p>
      <p>You're officially registered for <strong>${data.hackathonName}</strong>!</p>
      <div class="info-box">
        <strong>Event Date:</strong> ${data.hackathonDate}
      </div>
      <p>Next steps:</p>
      <ul>
        <li>Join our Discord/Slack community</li>
        <li>Download resources and problem statements</li>
        <li>Form your team or find teammates</li>
        <li>Prepare for the hackathon</li>
      </ul>
      <a href="${data.dashboardUrl}" class="cta-button">View Dashboard</a>
      <p>Good luck! We're excited to see what you'll build! 🚀</p>
    `;
    return this.baseTemplate(content, 'Registration Confirmed');
  }

  static teamInvitation(data: Record<string, any>): string {
    const content = `
      <h2>Team Invitation 👥</h2>
      <p>Hi ${data.inviterName ? data.inviterName + ' has invited you' : 'You\'ve been invited'} to join the team <strong>"${data.teamName}"</strong> for <strong>${data.hackathonName}</strong>!</p>
      <div class="info-box">
        <strong>Team:</strong> ${data.teamName}<br>
        <strong>Hackathon:</strong> ${data.hackathonName}
      </div>
      <p>Click below to accept the invitation:</p>
      <a href="${data.acceptUrl}" class="cta-button">Accept Invitation</a>
      <p>Once you accept, you'll be added to the team and can start collaborating.</p>
    `;
    return this.baseTemplate(content, 'Team Invitation');
  }

  static submissionReceived(data: Record<string, any>): string {
    const content = `
      <h2>Submission Received ✅</h2>
      <p>Hi ${data.name},</p>
      <p>Your submission for <strong>${data.hackathonName}</strong> has been received!</p>
      <div class="info-box">
        <strong>Project:</strong> ${data.projectTitle}<br>
        <strong>Status:</strong> <span class="badge">Submitted</span>
      </div>
      <p>Our judges will review your project and you'll receive feedback soon.</p>
      <a href="${data.submissionUrl}" class="cta-button">View Submission</a>
      <p>Thank you for participating! 🙌</p>
    `;
    return this.baseTemplate(content, 'Submission Received');
  }

  static scoreNotification(data: Record<string, any>): string {
    const content = `
      <h2>Your Project Was Scored 📊</h2>
      <p>Hi ${data.name},</p>
      <p>The judges have scored your project <strong>"${data.projectTitle}"</strong> for <strong>${data.hackathonName}</strong>!</p>
      <div class="info-box">
        <strong>Score:</strong> ${data.score}/100<br>
        <strong>Hackathon:</strong> ${data.hackathonName}
      </div>
      ${data.feedback ? `
        <h3>Feedback from Judges:</h3>
        <div class="info-box">
          ${data.feedback}
        </div>
      ` : ''}
      <p>Check the leaderboard to see how you rank:</p>
      <a href="${data.leaderboardUrl}" class="cta-button">View Leaderboard</a>
    `;
    return this.baseTemplate(content, 'Your Project Score');
  }

  static winnerAnnouncement(data: Record<string, any>): string {
    const content = `
      <h2>🎉 Congratulations! You Won! 🎉</h2>
      <p>Hi ${data.name},</p>
      <p>Fantastic news! You've won <strong>${data.prize}</strong> at <strong>${data.hackathonName}</strong>!</p>
      <div class="info-box" style="background-color: #fff4e6; border-left-color: #ffc107;">
        <strong>Prize:</strong> ${data.prize}<br>
        <strong>Award Ceremony:</strong> ${data.ceremonyDate}
      </div>
      <p>You've been invited to the award ceremony. Join us to celebrate your achievement:</p>
      <a href="${data.ceremonyUrl}" class="cta-button">Join Ceremony</a>
      <p>We're incredibly proud of your work! Keep innovating and building amazing projects! 🚀</p>
    `;
    return this.baseTemplate(content, 'You Won an Award!');
  }

  static deadlineReminder(data: Record<string, any>): string {
    const urgent = data.hoursUntil <= 24;
    const content = `
      <h2>${urgent ? '⏰ Urgent: ' : ''}Deadline Reminder ⏰</h2>
      <p>Hi ${data.name},</p>
      <p>This is a reminder that the <strong>${data.eventType}</strong> deadline for <strong>${data.hackathonName}</strong> is in <strong>${data.hoursUntil} hours</strong>!</p>
      <div class="info-box" style="${urgent ? 'background-color: #ffe6e6; border-left-color: #ff4444;' : ''}">
        <strong>Event:</strong> ${data.hackathonName}<br>
        <strong>Deadline:</strong> ${data.hoursUntil} hours remaining
      </div>
      <p>Don't miss out! Take action now:</p>
      <a href="${data.actionUrl}" class="cta-button">Go to ${data.eventType.charAt(0).toUpperCase() + data.eventType.slice(1)}</a>
    `;
    return this.baseTemplate(content, `Deadline Reminder - ${data.hackathonName}`);
  }

  static hackathonAnnouncement(data: Record<string, any>): string {
    const content = `
      <h2>${data.title}</h2>
      <p>Hi there,</p>
      <p>${data.message}</p>
      <a href="${data.actionUrl}" class="cta-button">${data.actionText}</a>
      <p>For more information, visit the hackathon page.</p>
    `;
    return this.baseTemplate(content, `${data.hackathonName}: ${data.title}`);
  }

  static defaultTemplate(data: Record<string, any>): string {
    const content = `
      <h2>Notification</h2>
      <p>You have received a notification from the Hackathon Platform.</p>
      <p>${JSON.stringify(data, null, 2)}</p>
    `;
    return this.baseTemplate(content, 'Notification');
  }
}
