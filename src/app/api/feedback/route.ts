import { NextRequest, NextResponse } from 'next/server';

interface FeedbackData {
  type: 'bug' | 'feedback' | 'general';
  subject: string;
  message: string;
  userEmail: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json();
    
    // Validate required fields
    if (!body.subject || !body.message || !body.userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create email content
    const emailSubject = `[Woortec ${body.type.toUpperCase()}] ${body.subject}`;
    
    const emailBody = `
New ${body.type} report from Woortec application:

Type: ${body.type}
Subject: ${body.subject}
User Email: ${body.userEmail}
Timestamp: ${body.timestamp}
URL: ${body.url}
User Agent: ${body.userAgent}

Message:
${body.message}

---
This email was sent automatically from the Woortec feedback system.
    `.trim();

    // Send email using a simple email service
    // For production, you might want to use a service like SendGrid, AWS SES, or Resend
    const emailResponse = await sendEmail({
      to: 'alvaro@woortec.com',
      subject: emailSubject,
      text: emailBody,
      from: 'feedback@woortec.com',
    });

    if (emailResponse.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Email sending failed:', emailResponse.error);
      return NextResponse.json(
        { error: 'Failed to send feedback' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email sending function
// In production, replace this with a proper email service like SendGrid, AWS SES, or Resend
async function sendEmail({ 
  to, 
  subject, 
  text, 
  from 
}: { 
  to: string; 
  subject: string; 
  text: string; 
  from: string;
}) {
  try {
    // For development/testing, we'll log the email content
    console.log('\n=== FEEDBACK EMAIL ===');
    console.log('From:', from);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', text);
    console.log('=====================\n');

    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: from },
    //     subject: subject,
    //     content: [{ type: 'text/plain', value: text }],
    //   }),
    // });

    // Example with Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: from,
    //     to: [to],
    //     subject: subject,
    //     text: text,
    //   }),
    // });

    // For now, we'll simulate a successful email send
    // In production, uncomment and configure one of the above email services
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
} 