import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AnalyzedReview, HistorySummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (dateParam) {
      // Fetch all reviews for a specific date
      const { data, error } = await supabase
        .from('review_analysis')
        .select('*')
        .eq('analyzed_on', dateParam)
        .order('review_no', { ascending: true });

      if (error) {
        console.error('Error fetching date reviews:', error);
        return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 500 });
      }

      return NextResponse.json({ reviews: data || [] });
    }

    // Fetch all history grouped by analyzed_on
    const { data, error } = await supabase
      .from('review_analysis')
      .select('analyzed_on, sentiment, is_safety_issue, model_used')
      .order('analyzed_on', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ summaries: [] });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ summaries: [] });
    }

    // Grouping by analyzed_on
    const dateMap = new Map<string, {
      total: number;
      valid: number;
      negative: number;
      safety: number;
      models: Set<string>;
    }>();

    for (const row of data) {
      const date = row.analyzed_on || '미지정';
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          total: 0,
          valid: 0,
          negative: 0,
          safety: 0,
          models: new Set<string>(),
        });
      }
      const entry = dateMap.get(date)!;
      entry.total += 1;
      if (row.sentiment !== '광고') {
        entry.valid += 1;
        if (row.sentiment === '부정') {
          entry.negative += 1;
        }
      }
      if (row.is_safety_issue) {
        entry.safety += 1;
      }
      if (row.model_used) {
        entry.models.add(row.model_used);
      }
    }

    const summaries: HistorySummary[] = Array.from(dateMap.entries()).map(([analyzed_on, stats]) => {
      const negativeRate = stats.valid > 0 ? Math.round((stats.negative / stats.valid) * 100) : 0;
      return {
        analyzed_on,
        total_count: stats.total,
        valid_count: stats.valid,
        negative_count: stats.negative,
        negative_rate: negativeRate,
        safety_count: stats.safety,
        models: Array.from(stats.models),
      };
    });

    return NextResponse.json({ summaries });
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 500 });
  }
}
