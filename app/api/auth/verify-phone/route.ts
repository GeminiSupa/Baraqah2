import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Phone OTP verification is disabled' },
      { status: 410 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Phone OTP verification is disabled' },
      { status: 500 }
    )
  }
}