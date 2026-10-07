import { NextRequest, NextResponse } from 'next/server';
import { fetchConsumerSafetyHarmData } from '@/lib/safety-cache';

export async function GET(request: NextRequest) {
  try {
    const customKey = request.headers.get('x-safety-api-key') || undefined;
    const data = await fetchConsumerSafetyHarmData(customKey);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        totalCollected: 0,
        vacuumCount: 0,
        topReasons: [],
        error: '불러오지 못했습니다',
      },
      { status: 500 }
    );
  }
}
