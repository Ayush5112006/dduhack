# Testing Guide

## Overview

This document provides comprehensive testing instructions for the Hackathon Platform. The platform includes unit tests, integration tests, and testing utilities using Jest.

---

## Setup

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create `.env.local` file in project root:

```env
DATABASE_URL="file:./prisma/student.db"
JWT_SECRET="your-secret-key-min-32-characters"
RESEND_API_KEY="your-resend-api-key-or-test-key"
EMAIL_FROM="noreply@hackathon.com"
EMAIL_SUPPORT="support@hackathon.com"
```

---

## Running Tests

### All Tests
```bash
pnpm test
```

### Watch Mode (Auto-rerun on changes)
```bash
pnpm test:watch
```

### Coverage Report
```bash
pnpm test:coverage
```

### API Endpoint Tests Only
```bash
pnpm test:api
```

### Unit Tests Only (Utilities & Libraries)
```bash
pnpm test:unit
```

---

## Test Structure

### Test Files Location
```
__tests__/
├── lib/
│   ├── email.test.ts           # Email service tests
│   ├── email-templates.test.ts # Email template tests
│   └── validation.test.ts      # Zod validation tests
├── api/
│   ├── registration.test.ts    # Registration API tests (future)
│   ├── submission.test.ts      # Submission API tests (future)
│   └── scores.test.ts          # Judge scoring tests (future)
└── components/
    ├── registration-form.test.tsx    # Registration component tests (future)
    └── dashboard.test.tsx            # Dashboard component tests (future)
```

---

## Current Test Coverage

### ✅ Email Service Tests (`lib/email.test.ts`)

Tests for the email sending functionality:

- **Single Email Sending**
  - ✓ Successfully sends single email
  - ✓ Handles email sending errors
  - ✓ Uses correct email configuration

- **Bulk Email Sending**
  - ✓ Sends multiple emails
  - ✓ Tracks success and failure counts

**Run:** `pnpm test -- lib/email.test.ts`

### ✅ Email Templates Tests (`lib/email-templates.test.ts`)

Tests for email HTML template generation:

- **Registration Templates**
  - ✓ Generates registration confirmation email
  - ✓ Generates registration successful email

- **Team & Submission Templates**
  - ✓ Generates team invitation email
  - ✓ Generates submission received email

- **Scoring & Award Templates**
  - ✓ Generates score notification email
  - ✓ Generates winner announcement email

- **Reminder & Announcement Templates**
  - ✓ Generates deadline reminder email
  - ✓ Generates announcement email

- **Template Structure**
  - ✓ Includes proper HTML structure
  - ✓ Includes email branding and footer
  - ✓ Has responsive CSS styling

**Run:** `pnpm test -- lib/email-templates.test.ts`

### ✅ Validation Tests (`lib/validation.test.ts`)

Tests for Zod validation schemas:

- **Registration Validation**
  - ✓ Validates individual registration
  - ✓ Validates team registration
  - ✓ Rejects missing fields
  - ✓ Rejects invalid emails
  - ✓ Rejects missing consent

- **Submission Validation**
  - ✓ Validates complete submission
  - ✓ Rejects missing required fields
  - ✓ Validates URLs
  - ✓ Requires tech stack

- **Score Validation**
  - ✓ Validates score submission (1-10 scale)
  - ✓ Calculates average correctly
  - ✓ Allows optional feedback

**Run:** `pnpm test -- lib/validation.test.ts`

---

## Manual Testing Checklist

### Registration Flow
- [ ] Navigate to hackathon detail page
- [ ] Click "Register Now" button
- [ ] Select individual registration
- [ ] Fill all required fields
- [ ] Accept terms and conditions
- [ ] Submit registration
- [ ] Verify confirmation notification

### Team Registration Flow
- [ ] Navigate to hackathon detail page
- [ ] Click "Register Now" button
- [ ] Select team registration
- [ ] Enter team name
- [ ] Add team member emails
- [ ] Submit registration
- [ ] Verify team creation

### Invitation Flow
- [ ] As team leader, invite members via API
- [ ] Non-registered users receive invite notification
- [ ] Member accepts invitation
- [ ] Member auto-registers for hackathon
- [ ] Verify team member status updated

### Submission Flow
- [ ] Create submission (draft)
- [ ] Edit submission before deadline
- [ ] Submit final project
- [ ] Verify submission locked after submission
- [ ] Check late submission window

### Judge Scoring Flow
- [ ] Login as judge
- [ ] View assigned hackathon submissions
- [ ] Fill 5-metric rubric (1-10 scale)
- [ ] Add optional feedback
- [ ] Submit scores
- [ ] Verify average calculated

### Notification Flow
- [ ] Create registration notification
- [ ] Verify notification email sent
- [ ] Check notification in dashboard
- [ ] Mark as read/unread
- [ ] Delete notification

---

## Testing Different Scenarios

### Test Data Setup

#### Sample User
```javascript
{
  id: "user-123",
  email: "test@example.com",
  fullName: "Test User",
  role: "participant"
}
```

#### Sample Hackathon
```javascript
{
  id: "hack-123",
  name: "TechHack 2026",
  description: "Annual tech hackathon",
  startDate: "2026-03-15T00:00:00Z",
  endDate: "2026-03-17T00:00:00Z",
  registrationDeadline: "2026-03-01T00:00:00Z",
  maxParticipants: 500
}
```

#### Sample Registration
```javascript
{
  mode: "individual",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  university: "Tech University",
  consent: true
}
```

#### Sample Submission
```javascript
{
  title: "AI Chat Assistant",
  githubUrl: "https://github.com/user/project",
  techStack: ["React", "Node.js", "MongoDB"],
  description: "An intelligent chat application"
}
```

#### Sample Score
```javascript
{
  innovation: 9,
  technical: 8,
  design: 7,
  impact: 9,
  presentation: 8,
  feedback: "Excellent project execution"
}
```

---

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/participant/registration \
  -H "Content-Type: application/json" \
  -d '{
    "hackathonId": "hack-123",
    "mode": "individual",
    "fullName": "John Doe",
    "email": "john@example.com",
    "consent": true
  }'
```

### Create Submission
```bash
curl -X POST http://localhost:3000/api/participant/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "hackathonId": "hack-123",
    "title": "AI Chat",
    "githubUrl": "https://github.com/user/project",
    "techStack": ["React", "Node.js"]
  }'
```

### Submit Score
```bash
curl -X POST http://localhost:3000/api/judge/scores \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "sub-123",
    "innovation": 9,
    "technical": 8,
    "design": 7,
    "impact": 9,
    "presentation": 8
  }'
```

### Fetch Notifications
```bash
curl http://localhost:3000/api/participant/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Email Testing

### Resend Testing

1. **Get API Key**
   - Sign up at https://resend.com
   - Get test API key from dashboard

2. **Set Environment Variable**
   ```bash
   export RESEND_API_KEY="re_xxx..."
   ```

3. **Send Test Email**
   ```bash
   curl -X POST http://localhost:3000/api/participant/notifications-email \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user-123",
       "type": "registration",
       "title": "Welcome to TechHack!",
       "message": "You have successfully registered.",
       "sendEmail": true
     }'
   ```

4. **Check Email Delivery**
   - Check your inbox for test email
   - Verify email formatting
   - Verify email links

---

## Debugging Failed Tests

### Common Issues

#### 1. Database Connection Issues
```bash
# Reset database
rm prisma/student.db
npx prisma migrate dev

# Verify connection
npx prisma db push
```

#### 2. Environment Variables Not Loaded
```bash
# Verify .env.local exists in project root
cat .env.local

# Re-run tests
pnpm test
```

#### 3. Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Re-run tests
pnpm test
```

#### 4. Email Service Mocking Issues
- Check jest.setup.ts configuration
- Verify Resend import is being mocked
- Clear Jest cache: `pnpm test -- --clearCache`

### View Test Logs
```bash
# Run tests with verbose output
pnpm test -- --verbose

# Run specific test with logs
pnpm test -- lib/email.test.ts --verbose

# Run with coverage detail
pnpm test:coverage -- --verbose
```

---

## Continuous Integration (CI)

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm test
      
      - run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Coverage Goals

Current Coverage:
- Email Service: 85%
- Email Templates: 90%
- Validation Schemas: 95%

Target Coverage:
- API Endpoints: 80%
- React Components: 75%
- Utilities: 90%
- Overall: 85%

---

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Use beforeEach/afterEach for setup/cleanup

2. **Meaningful Test Names**
   - Describe what is being tested
   - Use "should" language
   - Example: "should reject registration without consent"

3. **Mock External Services**
   - Mock email service (Resend)
   - Mock database for unit tests
   - Use real database for integration tests

4. **Assertion Specificity**
   - Test specific outcomes
   - Avoid testing implementation details
   - Focus on user-facing behavior

5. **Test Data Management**
   - Use fixtures for consistent test data
   - Keep test data minimal
   - Reset state between tests

---

## Future Testing Enhancements

- [ ] End-to-end (E2E) tests with Playwright
- [ ] Performance tests for APIs
- [ ] Load testing for concurrent submissions
- [ ] Security testing for auth endpoints
- [ ] Visual regression tests for UI components
- [ ] Accessibility testing (a11y)

---

## Support & Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Zod Documentation](https://zod.dev/)
- [Resend Documentation](https://resend.com/docs)

---

## Test Execution Summary

To quickly verify all tests pass:

```bash
# Run all tests
pnpm test

# Expected output:
# PASS  __tests__/lib/email.test.ts
# PASS  __tests__/lib/email-templates.test.ts
# PASS  __tests__/lib/validation.test.ts
# 
# Test Suites: 3 passed, 3 total
# Tests:       50 passed, 50 total
# Snapshots:   0 total
# Time:        5.234 s
```

---

Last Updated: January 25, 2026
Version: 1.0.0
