'use client';

import React, { useState } from 'react';
import { AnalyzedReview, SentimentType } from '@/lib/types';
import { Search, Filter, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ReviewTableProps {
  reviews: AnalyzedReview[];
}

export default function ReviewTable({ reviews }: ReviewTableProps) {
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [safetyOnly, setSafetyOnly] = useState(false);
  const [improvementOnly, setImprovementOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = reviews.filter((r) => {
    if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
    if (safetyOnly && !r.is_safety_issue) return false;
    if (improvementOnly && !r.improvement_request) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchText = r.review_text.toLowerCase().includes(term);
      const matchCat = r.categories.toLowerCase().includes(term);
      const matchReq = r.improvement_request?.toLowerCase().includes(term);
      if (!matchText && !matchCat && !matchReq) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedReviews = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const header = ['번호', '작성일', '별점', '감성', '유형', '개선요청', '안전이슈', '모델', '리뷰본문'];
    const rows = filtered.map((r) => [
      r.review_no,
      r.written_on,
      r.rating,
      r.sentiment,
      `"${r.categories.replace(/"/g, '""')}"`,
      `"${(r.improvement_request || '').replace(/"/g, '""')}"`,
      r.is_safety_issue ? 'Y' : 'N',
      r.model_used,
      `"${r.review_text.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `클린핏미니_분석결과_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            리뷰별 분석 상세 데이터 목록
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            전체 {reviews.length}건 중 필터링된 결과 {filtered.length}건
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>CSV 내보내기</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Sentiment Filter */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs">
          <button
            onClick={() => { setFilterSentiment('all'); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              filterSentiment === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            전체 ({reviews.length})
          </button>
          <button
            onClick={() => { setFilterSentiment('부정'); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              filterSentiment === '부정'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            부정 ({reviews.filter((r) => r.sentiment === '부정').length})
          </button>
          <button
            onClick={() => { setFilterSentiment('긍정'); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              filterSentiment === '긍정'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            긍정 ({reviews.filter((r) => r.sentiment === '긍정').length})
          </button>
          <button
            onClick={() => { setFilterSentiment('중립'); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              filterSentiment === '중립'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            중립 ({reviews.filter((r) => r.sentiment === '중립').length})
          </button>
          <button
            onClick={() => { setFilterSentiment('광고'); setCurrentPage(1); }}
            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
              filterSentiment === '광고'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            광고 ({reviews.filter((r) => r.sentiment === '광고').length})
          </button>
        </div>

        {/* Quick Toggles: Safety & Improvement */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSafetyOnly(!safetyOnly); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              safetyOnly
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
            <span>안전 이슈만</span>
          </button>
          <button
            onClick={() => { setImprovementOnly(!improvementOnly); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              improvementOnly
                ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>개선 요청만</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="본문/유형 검색..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">No</th>
              <th className="py-2.5 px-3 w-20">작성일</th>
              <th className="py-2.5 px-3 w-16">별점</th>
              <th className="py-2.5 px-3 w-16">감성</th>
              <th className="py-2.5 px-3 w-28">유형</th>
              <th className="py-2.5 px-3">리뷰 원문</th>
              <th className="py-2.5 px-3 w-40">개선 요청</th>
              <th className="py-2.5 px-3 w-20 text-center">안전이슈</th>
              <th className="py-2.5 px-3 w-24">분석모델</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  해당 조건의 리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((r) => (
                <tr
                  key={r.review_no}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    r.is_safety_issue ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                    {r.review_no}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {r.written_on}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-amber-600">★ {r.rating}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        r.sentiment === '긍정'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                          : r.sentiment === '부정'
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                          : r.sentiment === '광고'
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.sentiment}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{r.categories}</span>
                  </td>
                  <td className="py-2.5 px-3 font-normal text-slate-800 max-w-md">
                    <p className="line-clamp-2">{r.review_text}</p>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    {r.improvement_request ? (
                      <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block truncate" title={r.improvement_request}>
                        {r.improvement_request}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {r.is_safety_issue ? (
                      <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-[11px]">
                        <ShieldAlert className="h-3 w-3" />
                        위험
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {r.model_used}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            페이지 <span className="font-semibold text-slate-800">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
