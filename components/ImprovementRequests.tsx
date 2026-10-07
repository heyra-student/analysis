'use client';

import React, { useState } from 'react';
import { AnalyzedReview } from '@/lib/types';
import { Lightbulb, Sparkles, Filter, Search } from 'lucide-react';

interface ImprovementRequestsProps {
  reviews: AnalyzedReview[];
}

export default function ImprovementRequests({ reviews }: ImprovementRequestsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const improvementList = reviews.filter((r) => Boolean(r.improvement_request));

  const filtered = improvementList.filter((item) => {
    const matchesSearch =
      item.improvement_request?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.review_text.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || item.categories.includes(selectedCategory);

    return matchesSearch && matchesCat;
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                제품 개선 VOC
              </span>
              <span className="text-xs text-slate-500">고객의 솔직한 건의사항 추출</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              고객 개선 요청 사항 모아보기 («~면 좋겠어요», «~해 주세요»)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            총 {improvementList.length}건 건의 발굴
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="개선 요청 키워드 검색 (예: 거치대, 배터리, 설명서)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="my-8 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
          해당 조건의 개선 요청 사항이 없습니다.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.review_no}
              className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/20 to-white p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-bold text-slate-700">리뷰 #{item.review_no}</span>
                  <span className="text-amber-600 font-semibold">★ {item.rating}점</span>
                </div>

                {/* Highlighted improvement sentence */}
                <div className="rounded-lg bg-amber-100/60 p-2.5 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>추출된 개선 요청:</span>
                  </div>
                  <p className="text-xs font-bold text-amber-950 leading-snug">
                    "{item.improvement_request}"
                  </p>
                </div>

                {/* Original review snippet */}
                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 italic">
                  "{item.review_text}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {item.categories}
                </span>
                <span className="text-slate-400">{item.written_on}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
