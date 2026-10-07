'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AnalyzedReview, VALID_CATEGORIES } from '@/lib/types';
import { BarChart3, Filter } from 'lucide-react';

interface CategoryChartProps {
  reviews: AnalyzedReview[];
}

export default function CategoryChart({ reviews }: CategoryChartProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'negativeOnly'>('all');

  // Count occurrences per category
  const categoryStats = VALID_CATEGORIES.map((cat) => {
    let totalOccurrences = 0;
    let negativeOccurrences = 0;

    for (const r of reviews) {
      if (r.sentiment === '광고') continue; // 광고 제외
      const cats = r.categories.split(',').map((c) => c.trim());
      if (cats.includes(cat) || r.categories.includes(cat)) {
        totalOccurrences += 1;
        if (r.sentiment === '부정') {
          negativeOccurrences += 1;
        }
      }
    }

    return {
      category: cat,
      전체언급: totalOccurrences,
      불만부정: negativeOccurrences,
    };
  });

  // Sort by negative occurrences descending if in negativeOnly mode, else by total
  const sortedData = [...categoryStats]
    .filter((d) => (filterMode === 'negativeOnly' ? d.불만부정 > 0 : d.전체언급 > 0))
    .sort((a, b) =>
      filterMode === 'negativeOnly'
        ? b.불만부정 - a.불만부정
        : b.전체언급 - a.전체언급
    );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">유형별 불만 및 언급 건수</h3>
          </div>
          <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 언급순
            </button>
            <button
              onClick={() => setFilterMode('negativeOnly')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filterMode === 'negativeOnly'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              불만(부정) 집중
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          복수 카테고리를 포함한 리뷰를 세분화하여 불만 집중 항목(배터리, 소음, 배송 등)을 진단합니다.
        </p>

        {sortedData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            분석된 유형 데이터가 없습니다.
          </div>
        ) : (
          <div className="h-72 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis
                  type="category"
                  dataKey="category"
                  fontSize={11}
                  stroke="#475569"
                  tickLine={false}
                  width={65}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}건`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                />
                <Bar dataKey="전체언급" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="불만부정" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span>💡 불만 유형 1위 항목이 가장 시급한 개선 대상입니다.</span>
        {sortedData.length > 0 && (
          <span className="font-semibold text-rose-600">
            최다 불만: {sortedData[0].category} ({sortedData[0].불만부정}건)
          </span>
        )}
      </div>
    </div>
  );
}
