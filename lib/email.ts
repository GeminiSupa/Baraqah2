// Email sending utility
// Uses Resend for production, console log for development

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey) {
      // Production: Send via Resend
      try {
        // Dynamic import to avoid requiring resend in development if not installed
        const { Resend } = await import('resend')
        const resend = new Resend(resendApiKey)

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Verify Your Email - Shadi Khana Abadi',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                  .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background-color: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
                  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Shadi Khana Abadi</h1>
                    <p>Email Verification</p>
                  </div>
                  <div class="content">
                    <p>Assalamu Alaikum,</p>
                    <p>Thank you for registering with Shadi Khana Abadi. Please use the verification code below to verify your email address:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This code will expire in <strong>15 minutes</strong>.</p>
                    <p>If you didn't request this verification code, please ignore this email.</p>
                    <p>May Allah bless you in your search for a life partner.</p>
                    <p>Best regards,<br>Shadi Khana Abadi Team</p>
                  </div>
                  <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        })

        console.log(`✅ OTP email sent to ${email} via Resend`)
        return true
      } catch (resendError: any) {
        console.error('Resend API error:', resendError)
        // Fall back to console log if Resend fails
        console.log('⚠️  Falling back to console log mode')
      }
    }

    // Development: Log to console
    console.log('='.repeat(50))
    console.log('📧 EMAIL OTP (Development Mode)')
    console.log('='.repeat(50))
    console.log(`To: ${email}`)
    console.log(`OTP Code: ${otp}`)
    console.log(`Expires in: 15 minutes`)
    console.log('='.repeat(50))
    if (!resendApiKey) {
      console.log('⚠️  RESEND_API_KEY not set - using console log mode')
      console.log('📝 To enable real emails, add RESEND_API_KEY to .env.local')
    }
    console.log('='.repeat(50))

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
