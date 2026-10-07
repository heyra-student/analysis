'use client';

import React, { useEffect, useState } from 'react';
import { AnalyzedReview, SafetyHarmResponse } from '@/lib/types';
import { ShieldAlert, AlertTriangle, Building2, Flame, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface SafetyAlertSectionProps {
  reviews: AnalyzedReview[];
  customSafetyApiKey?: string;
}

export default function SafetyAlertSection({
  reviews,
  customSafetyApiKey,
}: SafetyAlertSectionProps) {
  const [harmData, setHarmData] = useState<SafetyHarmResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const safetyReviews = reviews.filter((r) => r.is_safety_issue);

  const fetchHarmStats = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const headers: Record<string, string> = {};
      if (customSafetyApiKey) {
        headers['x-safety-api-key'] = customSafetyApiKey;
      }

      const res = await fetch('/api/safety', { headers });
      const data: SafetyHarmResponse = await res.json();

      if (!res.ok || data.error) {
        setLoadError(data.error || '불러오지 못했습니다');
        setHarmData(data);
      } else {
        setHarmData(data);
      }
    } catch (err: any) {
      setLoadError('불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHarmStats();
  }, [customSafetyApiKey]);

  return (
    <div className="rounded-2xl border border-red-200/90 bg-gradient-to-b from-red-50/40 via-white to-white p-5 sm:p-6 shadow-sm">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-red-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                중점 관리 대상
              </span>
              <span className="text-xs text-slate-500 font-medium">안전사고 예방 & 공공데이터 연계</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              안전 이슈 분석 & 한국소비자원 위해정보 연동
            </h3>
          </div>
        </div>

        <button
          onClick={fetchHarmStats}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>위해정보 새로고침 (24h 캐시)</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 한국소비자원 위해정보 API 통계 (7 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  한국소비자원 위해정보 현황 (공공 API)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                품목: 가정용 진공청소기
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              공공데이터포털 위해정보 3,000건 중 <span className="font-semibold text-slate-900">가정용 진공청소기</span> 사고 원인(injuryReason) 상위 1~3위를 추출합니다.
            </p>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                공공데이터 3,000건 수집 및 필터링 중...
              </div>
            ) : loadError ? (
              <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto mb-1.5" />
                <div className="text-sm font-bold text-amber-900">불러오지 못했습니다</div>
                <div className="text-xs text-amber-700 mt-1">
                  {loadError}
                </div>
              </div>
            ) : harmData && harmData.topReasons.length > 0 ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>총 표본: 3,000건 중 청소기 <strong>{harmData.vacuumCount}건</strong> 접수</span>
                  {harmData.cachedAt && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      24시간 캐시 저장됨
                    </span>
                  )}
                </div>

                {harmData.topReasons.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? 'bg-red-600 text-white'
                            : idx === 1
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-400 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.injuryReason}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        {item.count}건 <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, item.percentage * 2))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                불러오지 못했습니다 (해당 기간 청소기 위해 정보 없음)
              </div>
            )}
          </div>

          <div className="mt-4 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
            출처: 공공데이터포털(data.go.kr) 한국소비자원_소비자 위해 정보 API
          </div>
        </div>

        {/* Right: 「클린핏 미니」 실리뷰 안전 이슈 매칭 (5 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-red-200 bg-red-50/30 p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-red-200/60">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-600" />
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                  클린핏 미니 접수된 안전 이슈 키워드
                </h4>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {safetyReviews.length}건 감지
              </span>
            </div>

            <p className="mt-2 text-xs text-red-700">
              뜨거움, 발열, 과열, 냄새, 탄내, 연기, 감전 키워드가 포함된 리뷰는 무조건 안전 이슈로 분류됩니다.
            </p>

            {safetyReviews.length === 0 ? (
              <div className="my-8 rounded-xl bg-white p-6 text-center border border-emerald-200">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-emerald-800">
                  현재 분석된 리뷰 중 안전 이슈가 감지되지 않았습니다.
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  주기적으로 리뷰를 재분석하여 안전 사고를 사전 예방하세요.
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {safetyReviews.map((r) => (
                  <div
                    key={r.review_no}
                    className="rounded-xl border border-red-200 bg-white p-3 shadow-sm hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-700 font-mono">
                          리뷰 #{r.review_no}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {r.written_on}
                        </span>
                      </div>
                      <span className="font-semibold text-amber-600 text-xs">
                        ★ {r.rating}점
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-medium text-slate-900 leading-relaxed bg-red-50/50 p-2 rounded-lg border border-red-100">
                      "{r.review_text}"
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        유형: <strong className="text-slate-700">{r.categories}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        화재/화상 위험 주의
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-2 text-[11px] text-red-700/80 border-t border-red-200/60 font-medium">
            ⚠️ 대표님/팀장님 보고 시 위해정보 통계와 충전기 발열 VOC를 연계하여 제품 리콜 또는 어댑터 사양 교체 대응을 권고합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
