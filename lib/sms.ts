// SMS sending utility
// Uses Twilio for production, console log for development

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  try {
    // Check if Twilio is configured
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Production: Send via Twilio
      try {
        // Dynamic import to avoid requiring twilio in development if not installed
        const twilio = await import('twilio')
        const client = twilio.default(twilioAccountSid, twilioAuthToken)

        await client.messages.create({
          body: `Assalamu Alaikum! Your Shadi Khana Abadi verification code is: ${otp}. Valid for 15 minutes.`,
          from: twilioPhoneNumber,
          to: phone,
        })

        console.log(`✅ OTP SMS sent to ${phone} via Twilio`)
        return true
      } catch (twilioError: any) {
        console.error('Twilio API error:', twilioError)
        // Fall back to console log if Twilio fails
        console.log('⚠️  Falling back to console log mode')
      }
    }

    // Development: Log to console
    console.log('='.repeat(50))
    console.log('📱 SMS OTP (Development Mode)')
    console.log('='.repeat(50))
    console.log(`To: ${phone}`)
    console.log(`OTP Code: ${otp}`)
    console.log(`Expires in: 15 minutes`)
    console.log('='.repeat(50))
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('⚠️  Twilio credentials not set - using console log mode')
      console.log('📝 To enable real SMS, add TWILIO_* variables to .env.local')
    }
    console.log('='.repeat(50))

    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}
