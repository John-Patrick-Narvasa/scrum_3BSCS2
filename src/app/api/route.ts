import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Hope, Inc. ERP API is active',
    timestamp: new Date().toISOString(),
  })
}
