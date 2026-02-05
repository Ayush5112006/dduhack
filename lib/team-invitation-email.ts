// Team Member Invitation Email Service - Updated for Existing Users

interface TeamInvitationEmailData {
  memberName: string
  memberEmail: string
  teamName: string
  hackathonTitle: string
  hackathonId: string
  teamRole: string
  generatedPassword?: string // Optional - only for new users
  isExistingUser: boolean // Flag to differentiate
  teamLeaderName: string
  registrationDetails: {
    domain?: string
    techStack?: string[]
    projectIdea?: string
  }
}

/**
 * Generate password for NEW team member
 * Format: First 4 letters of name + @ + Last 6 letters of email
 */
export function generateMemberPassword(name: string, email: string): string {
  const namePrefix = name.replace(/\s+/g, '').substring(0, 4)
  const emailPart = email.split('@')[0]
  const emailSuffix = emailPart.slice(-6)
  return `${namePrefix}@${emailSuffix}`
}

/**
 * Send invitation email to team member
 * Handles both NEW and EXISTING users
 */
export async function sendTeamInvitationEmail(data: TeamInvitationEmailData): Promise<boolean> {
  try {
    const emailContent = data.isExistingUser
      ? generateExistingUserEmailHTML(data)
      : generateNewUserEmailHTML(data)

    const subject = data.isExistingUser
      ? `You've been added to ${data.teamName} for ${data.hackathonTitle}`
      : `You've been invited to join ${data.teamName} for ${data.hackathonTitle}`

    console.log('=== TEAM INVITATION EMAIL ===')
    console.log('To:', data.memberEmail)
    console.log('Type:', data.isExistingUser ? 'EXISTING USER' : 'NEW USER')
    console.log('Subject:', subject)
    if (!data.isExistingUser && data.generatedPassword) {
      console.log('Generated Password:', data.generatedPassword)
    }
    console.log('============================')

    // TODO: Replace with actual email service
    return true
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return false
  }
}

/**
 * Email template for NEW users (with password)
 */
function generateNewUserEmailHTML(data: TeamInvitationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Team Invitation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
    .credentials { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; border-radius: 4px; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .tech-badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; display: inline-block; margin: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${data.teamName}!</h1>
      <p style="color: #6b7280; margin: 10px 0 0 0;">You've been invited to join a hackathon team</p>
    </div>
    
    <p>Hi <strong>${data.memberName}</strong>,</p>
    
    <p><strong>${data.teamLeaderName}</strong> has invited you to join <strong>"${data.teamName}"</strong> for:</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #3b82f6;">📅 ${data.hackathonTitle}</h3>
    </div>
    
    <h3>🔐 Your Account Credentials</h3>
    <div class="credentials">
      <p style="margin: 0 0 10px 0;"><strong>A new account has been created for you:</strong></p>
      <p><strong>Email:</strong> <code>${data.memberEmail}</code></p>
      <p><strong>Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${data.generatedPassword}</code></p>
      <p><strong>Role:</strong> ${data.teamRole}</p>
    </div>
    
    <div class="warning">
      <strong>⚠️ Important:</strong> Please change your password after your first login for security.
    </div>
    
    <h3>👥 Team Details</h3>
    <div class="detail-row"><strong>Team:</strong> ${data.teamName}</div>
    <div class="detail-row"><strong>Leader:</strong> ${data.teamLeaderName}</div>
    ${data.registrationDetails.domain ? `<div class="detail-row"><strong>Domain:</strong> ${data.registrationDetails.domain}</div>` : ''}
    ${data.registrationDetails.techStack && data.registrationDetails.techStack.length > 0 ? `
      <div class="detail-row">
        <strong>Tech Stack:</strong><br>
        ${data.registrationDetails.techStack.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
      </div>
    ` : ''}
    ${data.registrationDetails.projectIdea ? `
      <h3>💡 Project Idea</h3>
      <div class="info-box"><p style="margin: 0;">${data.registrationDetails.projectIdea}</p></div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login" class="button">Login to Your Account</a>
    </div>
    
    <h3>📋 Next Steps</h3>
    <ol>
      <li>Click the button above to login</li>
      <li>Change your password in profile settings</li>
      <li>Review hackathon details</li>
      <li>Coordinate with your team</li>
      <li>Start preparing!</li>
    </ol>
  </div>
</body>
</html>
  `
}

/**
 * Email template for EXISTING users (no password)
 */
function generateExistingUserEmailHTML(data: TeamInvitationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Team Invitation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
    .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .tech-badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; display: inline-block; margin: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You've Been Added to a Team!</h1>
      <p style="color: #6b7280; margin: 10px 0 0 0;">Great news about your hackathon participation</p>
    </div>
    
    <p>Hi <strong>${data.memberName}</strong>,</p>
    
    <p><strong>${data.teamLeaderName}</strong> has added you to team <strong>"${data.teamName}"</strong> for:</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #3b82f6;">📅 ${data.hackathonTitle}</h3>
    </div>
    
    <div class="success-box">
      <p style="margin: 0;"><strong>✅ You're all set!</strong></p>
      <p style="margin: 10px 0 0 0;">Use your existing account credentials to login and view team details.</p>
    </div>
    
    <h3>👥 Team Details</h3>
    <div class="detail-row"><strong>Team:</strong> ${data.teamName}</div>
    <div class="detail-row"><strong>Your Role:</strong> ${data.teamRole}</div>
    <div class="detail-row"><strong>Team Leader:</strong> ${data.teamLeaderName}</div>
    ${data.registrationDetails.domain ? `<div class="detail-row"><strong>Domain:</strong> ${data.registrationDetails.domain}</div>` : ''}
    ${data.registrationDetails.techStack && data.registrationDetails.techStack.length > 0 ? `
      <div class="detail-row">
        <strong>Tech Stack:</strong><br>
        ${data.registrationDetails.techStack.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
      </div>
    ` : ''}
    ${data.registrationDetails.projectIdea ? `
      <h3>💡 Project Idea</h3>
      <div class="info-box"><p style="margin: 0;">${data.registrationDetails.projectIdea}</p></div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/team" class="button">View Team Dashboard</a>
    </div>
    
    <h3>📋 Next Steps</h3>
    <ol>
      <li>Login with your existing credentials</li>
      <li>Visit your team dashboard</li>
      <li>Review hackathon and project details</li>
      <li>Coordinate with ${data.teamLeaderName} and team members</li>
      <li>Start preparing for the hackathon!</li>
    </ol>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      If you have any questions, please contact your team leader or our support team.
    </p>
  </div>
</body>
</html>
  `
}
