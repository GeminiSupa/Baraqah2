// OTP generation and management

// In-memory storage for OTPs (use database in production)
const otpStore = new Map<string, { code: string; expiresAt: number; type: 'email' | 'phone' }>()

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP with expiration (15 minutes)
export function storeOTP(identifier: string, code: string, type: 'email' | 'phone'): void {
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes
  otpStore.set(`${identifier}:${type}`, {
    code,
    expiresAt,
    type,
  })
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(`${identifier}:${type}`)
  }, 15 * 60 * 1000)
}

// Verify OTP
export function verifyOTP(identifier: string, code: string, type: 'email' | 'phone'): boolean {
  const key = `${identifier}:${type}`
  const stored = otpStore.get(key)
  
  if (!stored) {
    return false
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key)
    return false
  }
  
  if (stored.code !== code) {
    return false
  }
  
  // OTP verified, remove it
  otpStore.delete(key)
  return true
}

// Get stored OTP (for debugging/development)
export function getStoredOTP(identifier: string, type: 'email' | 'phone'): string | null {
  const key = `${identifier}:${type}`
  const stored = otpStore.get(key)
  
  if (!stored || Date.now() > stored.expiresAt) {
    return null
  }
  
  return stored.code
}
