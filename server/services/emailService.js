import { Resend } from 'resend';

let resend = null;

const getResendClient = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export const sendOTPEmail = async (email, otp, username) => {
  try {
    const client = getResendClient();
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    const { data, error } = await client.emails.send({
      from: 'Social Chat <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Email - Social Chat',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 40px;
                text-align: center;
              }
              .logo {
                font-size: 48px;
                margin-bottom: 20px;
              }
              h1 {
                color: #4f46e5;
                margin-bottom: 10px;
              }
              .otp-code {
                background: white;
                border: 2px solid #4f46e5;
                border-radius: 8px;
                padding: 20px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #4f46e5;
                margin: 30px 0;
              }
              .info {
                color: #666;
                font-size: 14px;
                margin-top: 20px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #999;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">💬</div>
              <h1>Verify Your Email</h1>
              <p>Hi ${username},</p>
              <p>Welcome to Social Chat! Please use the following code to verify your email address:</p>
              
              <div class="otp-code">${otp}</div>
              
              <div class="info">
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
              
              <div class="footer">
                <p>© 2024 Social Chat. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
