import { NextRequest, NextResponse } from 'next/server';
import { RawReview } from '@/lib/types';
import { analyzeReviewsWithGemini } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reviews: RawReview[] = body.reviews;
    const clientApiKey = request.headers.get('x-gemini-api-key') || undefined;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: '리뷰 데이터가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 1. Single batch Gemini request with fallback support
    const analysisResponse = await analyzeReviewsWithGemini(reviews, clientApiKey);

    if (analysisResponse.error || !analysisResponse.results || analysisResponse.results.length === 0) {
      return NextResponse.json(
        {
          error: analysisResponse.error || '불러오지 못했습니다',
          modelUsed: analysisResponse.modelUsed || '없음',
        },
        { status: 502 }
      );
    }

    const analyzedList = analysisResponse.results;
    const modelUsed = analysisResponse.modelUsed;

    // 2. Save directly to Supabase review_analysis table
    try {
      const recordsToInsert = analyzedList.map((item) => ({
        analyzed_on: item.analyzed_on,
        review_no: item.review_no,
        written_on: item.written_on,
        rating: item.rating,
        review_text: item.review_text,
        sentiment: item.sentiment,
        categories: item.categories,
        improvement_request: item.improvement_request,
        is_safety_issue: item.is_safety_issue,
        model_used: modelUsed,
      }));

      const { data: insertedData, error: dbError } = await supabase
        .from('review_analysis')
        .insert(recordsToInsert)
        .select('id');

      if (dbError) {
        console.error('Failed to insert analysis results into Supabase review_analysis:', dbError);
      } else {
        console.log(`Successfully saved ${insertedData?.length || recordsToInsert.length} reviews to Supabase.`);
      }
    } catch (dbEx) {
      console.error('Exception during Supabase save:', dbEx);
      // Even if DB save has an issue, we return the analyzed result with warning so the user sees analysis
    }

    return NextResponse.json({
      success: true,
      modelUsed,
      analyzedCount: analyzedList.length,
      results: analyzedList,
    });
  } catch (error: any) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      {
        error: '불러오지 못했습니다',
        details: error?.message || 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
