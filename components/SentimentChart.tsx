'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AnalyzedReview } from '@/lib/types';
import { PieChart as PieIcon, Info } from 'lucide-react';

interface SentimentChartProps {
  reviews: AnalyzedReview[];
}

const COLORS = {
  긍정: '#10b981', // Emerald
  부정: '#f43f5e', // Rose
  중립: '#64748b', // Slate
  광고: '#f59e0b', // Amber
};

export default function SentimentChart({ reviews }: SentimentChartProps) {
  const adCount = reviews.filter((r) => r.sentiment === '광고').length;
  const validReviews = reviews.filter((r) => r.sentiment !== '광고');
  const validTotal = validReviews.length;

  const positiveCount = validReviews.filter((r) => r.sentiment === '긍정').length;
  const negativeCount = validReviews.filter((r) => r.sentiment === '부정').length;
  const neutralCount = validReviews.filter((r) => r.sentiment === '중립').length;

  const chartData = [
    { name: '긍정', value: positiveCount, color: COLORS.긍정 },
    { name: '부정', value: negativeCount, color: COLORS.부정 },
    { name: '중립', value: neutralCount, color: COLORS.중립 },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">감성 분포 분석</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            실리뷰 {validTotal}건 기준
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          별점이 아닌 실제 리뷰 문맥과 반어법을 파악한 객관적 감성 분포입니다.
        </p>

        {validTotal === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-slate-400">
            표시할 데이터가 없습니다.
          </div>
        ) : (
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}건 (${validTotal > 0 ? ((value / validTotal) * 100).toFixed(1) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 광고 제외 안내 배너 */}
      <div className="mt-4 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 border border-amber-200/60 flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">엄격한 필터링 적용:</span> 체험단·원고료·무상 제공 등 광고성 리뷰{' '}
          <strong className="text-amber-800 underline decoration-amber-400">{adCount}건</strong>은 왜곡 방지를 위해 위
          집계에서 완전히 제외되었습니다.
        </div>
      </div>
    </div>
  );
}
