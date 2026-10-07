'use client';

import React, { useEffect, useState } from 'react';
import { HistorySummary, AnalyzedReview } from '@/lib/types';
import { History, Calendar, RefreshCw, ChevronRight, ThumbsDown, ShieldAlert, Cpu } from 'lucide-react';

interface AnalysisHistoryProps {
  onSelectDate: (date: string) => Promise<void>;
  currentSelectedDate?: string | null;
}

export default function AnalysisHistory({
  onSelectDate,
  currentSelectedDate,
}: AnalysisHistoryProps) {
  const [summaries, setSummaries] = useState<HistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg('불러오지 못했습니다');
      } else {
        setSummaries(data.summaries || []);
      }
    } catch {
      setErrorMsg('불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-md shadow-slate-500/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                히스토리 아카이브
              </span>
              <span className="text-xs text-slate-500">Supabase review_analysis 연동</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              과거 분석 결과 조회 (분석일자별 모아보기)
            </h3>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        지난 분석 결과를 분석일자별로 비교하여, 개선 조치 후 부정 비율과 안전 이슈 추이를 모니터링할 수 있습니다.
      </p>

      {isLoading ? (
        <div className="my-8 text-center text-xs text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
          저장된 분석 히스토리를 불러오는 중입니다...
        </div>
      ) : errorMsg ? (
        <div className="my-6 rounded-xl bg-amber-50 p-4 text-center text-xs font-semibold text-amber-800 border border-amber-200">
          {errorMsg}
        </div>
      ) : summaries.length === 0 ? (
        <div className="my-8 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
          아직 저장된 과거 분석 데이터가 없습니다. 상단에서 첫 리뷰 파일을 업로드하여 분석을 시작하세요.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {summaries.map((item) => {
            const isSelected = currentSelectedDate === item.analyzed_on;

            return (
              <div
                key={item.analyzed_on}
                onClick={() => onSelectDate(item.analyzed_on)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>분석일: {item.analyzed_on}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[11px] text-slate-500">총 리뷰 건수</span>
                    <p className="mt-0.5 font-bold text-slate-800">{item.total_count}건</p>
                  </div>
                  <div className="rounded-lg bg-rose-50/60 p-2 border border-rose-100">
                    <span className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold">
                      <ThumbsDown className="h-3 w-3" /> 부정 비율
                    </span>
                    <p className="mt-0.5 font-bold text-rose-700">
                      {item.negative_rate}% ({item.negative_count}건)
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                    안전 이슈: <strong className="text-red-700">{item.safety_count}건</strong>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <Cpu className="h-3 w-3 text-slate-400" />
                    {item.models.join(', ') || 'AI'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
