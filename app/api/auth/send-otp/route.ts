import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    // OTP-based authentication has been disabled.
    return NextResponse.json(
      { error: 'OTP verification is disabled' },
      { status: 410 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'OTP verification is disabled' },
      { status: 500 }
    )
  }
}
