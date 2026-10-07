'use client';

import React from 'react';
import { AnalyzedReview } from '@/lib/types';
import { MessageSquareText, ThumbsUp, ThumbsDown, ShieldAlert, Cpu, Award } from 'lucide-react';

interface DashboardSummaryProps {
  reviews: AnalyzedReview[];
  modelUsed: string;
}

export default function DashboardSummary({ reviews, modelUsed }: DashboardSummaryProps) {
  const totalCount = reviews.length;
  const adCount = reviews.filter((r) => r.sentiment === '광고').length;
  const validReviews = reviews.filter((r) => r.sentiment !== '광고');
  const validCount = validReviews.length;

  const positiveCount = validReviews.filter((r) => r.sentiment === '긍정').length;
  const negativeCount = validReviews.filter((r) => r.sentiment === '부정').length;
  const neutralCount = validReviews.filter((r) => r.sentiment === '중립').length;

  const positiveRate = validCount > 0 ? Math.round((positiveCount / validCount) * 100) : 0;
  const negativeRate = validCount > 0 ? Math.round((negativeCount / validCount) * 100) : 0;
  const safetyCount = reviews.filter((r) => r.is_safety_issue).length;

  // Average rating
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalCount).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. 총 리뷰 수 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold text-slate-500">총 리뷰 수</span>
          <MessageSquareText className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          평균 별점: <span className="font-semibold text-amber-600">★ {avgRating}</span>
        </div>
      </div>

      {/* 2. 광고 제외 실리뷰 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold text-slate-500">실제 유효 리뷰</span>
          <Award className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{validCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <div className="mt-1 text-[11px] text-amber-600 font-medium">
          광고 {adCount}건 집계 제외
        </div>
      </div>

      {/* 3. 긍정 비율 */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-600">
          <span className="text-xs font-semibold text-emerald-700">긍정 비율</span>
          <ThumbsUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-700">{positiveRate}%</span>
          <span className="text-xs text-emerald-600">({positiveCount}건)</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-600">
          광고 제외 실리뷰 기준
        </div>
      </div>

      {/* 4. 부정 비율 (핵심 모니터링) */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-rose-600">
          <span className="text-xs font-semibold text-rose-700">부정 비율 (불만)</span>
          <ThumbsDown className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-700">{negativeRate}%</span>
          <span className="text-xs text-rose-600">({negativeCount}건)</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-600">
          반어법·비꼼 포함 엄격 집계
        </div>
      </div>

      {/* 5. 안전 이슈 감지 */}
      <div className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${
        safetyCount > 0
          ? 'border-red-200 bg-red-50/80 animate-pulse-once'
          : 'border-slate-200/80 bg-white'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className={`text-xs font-semibold ${safetyCount > 0 ? 'text-red-700' : 'text-slate-500'}`}>
            안전 이슈 감지
          </span>
          <ShieldAlert className={`h-4 w-4 ${safetyCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-black ${safetyCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {safetyCount}
          </span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <div className={`mt-1 text-[11px] ${safetyCount > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
          {safetyCount > 0 ? '즉각 점검 필요 (발열 등)' : '안전 이슈 없음'}
        </div>
      </div>

      {/* 6. 응답 AI 모델 (화면 명시 필수 요구사항) */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-indigo-600">
          <span className="text-xs font-semibold text-indigo-800">응답 AI 모델</span>
          <Cpu className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800 font-mono break-all">
            {modelUsed || '미분석'}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          503 발생 시 Lite 자동 폴백
        </div>
      </div>
    </div>
  );
}
