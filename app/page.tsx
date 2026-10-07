'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import DashboardSummary from '@/components/DashboardSummary';
import SentimentChart from '@/components/SentimentChart';
import CategoryChart from '@/components/CategoryChart';
import SafetyAlertSection from '@/components/SafetyAlertSection';
import ImprovementRequests from '@/components/ImprovementRequests';
import ActionPlanCard from '@/components/ActionPlanCard';
import ReviewTable from '@/components/ReviewTable';
import AnalysisHistory from '@/components/AnalysisHistory';
import { AnalyzedReview, RawReview } from '@/lib/types';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [analyzedReviews, setAnalyzedReviews] = useState<AnalyzedReview[]>([]);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash (대기)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client-custom keys (optional, fallback to server env)
  const [customGeminiKey, setCustomGeminiKey] = useState<string>('');
  const [customSafetyKey, setCustomSafetyKey] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load latest analysis on mount if exists
  useEffect(() => {
    loadLatestHistory();
  }, []);

  const loadLatestHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.summaries && data.summaries.length > 0) {
        // Pick the most recent analyzed date
        const latestDate = data.summaries[0].analyzed_on;
        await loadDateReviews(latestDate);
      }
    } catch (err) {
      console.error('Error fetching initial history:', err);
    }
  };

  const loadDateReviews = async (date: string) => {
    try {
      setSelectedDate(date);
      const res = await fetch(`/api/history?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (data.reviews && data.reviews.length > 0) {
        setAnalyzedReviews(data.reviews);
        if (data.reviews[0]?.model_used) {
          setModelUsed(data.reviews[0].model_used);
        }
      }
    } catch (err) {
      console.error('Failed to load date reviews:', err);
    }
  };

  const handleStartAnalysis = async (reviews: RawReview[]) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress('1/3단계: 전체 리뷰를 Gemini AI에 단일 요청으로 전송 중...');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customGeminiKey) {
        headers['x-gemini-api-key'] = customGeminiKey;
      }

      setAnalysisProgress('2/3단계: 감성·불만유형·안전이슈 일괄 심층 분석 중...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reviews }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // PRD Requirement: 정직하게 「불러오지 못했습니다」 표기
        setErrorMessage(data.error || '불러오지 못했습니다');
        setModelUsed(data.modelUsed || '실패');
        return;
      }

      setAnalysisProgress('3/3단계: Supabase 데이터베이스 저장 및 대시보드 렌더링...');
      setAnalyzedReviews(data.results);
      setModelUsed(data.modelUsed);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage('불러오지 못했습니다');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header
        currentModel={modelUsed}
        hasCustomGeminiKey={Boolean(customGeminiKey)}
        onApiKeySave={(gKey, sKey) => {
          if (gKey) setCustomGeminiKey(gKey);
          if (sKey) setCustomSafetyKey(sKey);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Error Alert if AI failed */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900">
                {errorMessage}
              </h4>
              <p className="mt-1 text-xs text-red-700">
                AI 응답이 비어 있거나 외부 API와의 통신에 실패했습니다. 요구사항에 따라 별점으로 대체하지 않고 정직하게 안내드립니다. 상단 [API 설정]에서 키를 확인하시거나 잠시 후 다시 시도해 주세요.
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-600 font-bold hover:underline"
            >
              닫기
            </button>
          </div>
        )}

        {/* 1. File Uploader */}
        <section>
          <FileUploader
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
          />
        </section>

        {/* 2. Dashboard KPIs & Content (Visible when reviews exist) */}
        {analyzedReviews.length > 0 ? (
          <>
            {/* KPI Cards */}
            <section>
              <DashboardSummary reviews={analyzedReviews} modelUsed={modelUsed} />
            </section>

            {/* Charts Row: Sentiment + Categories */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <SentimentChart reviews={analyzedReviews} />
              </div>
              <div className="lg:col-span-7">
                <CategoryChart reviews={analyzedReviews} />
              </div>
            </section>

            {/* Safety Alert & Consumer Agency Harm Data Section */}
            <section>
              <SafetyAlertSection
                reviews={analyzedReviews}
                customSafetyApiKey={customSafetyKey}
              />
            </section>

            {/* Improvement VOC Requests */}
            <section>
              <ImprovementRequests reviews={analyzedReviews} />
            </section>

            {/* Action Plan (Manual 3-line input by Marketing team) */}
            <section>
              <ActionPlanCard />
            </section>

            {/* Detailed Reviews Table */}
            <section>
              <ReviewTable reviews={analyzedReviews} />
            </section>
          </>
        ) : (
          !isAnalyzing && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                리뷰 데이터 분석 대기 중
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                상단의 업로드 영역에 클린핏 미니 리뷰 파일(.csv, .txt)을 등록하고 분석을 시작하세요.
              </p>
            </div>
          )
        )}

        {/* 3. History Section (Bottom) */}
        <section className="pt-4">
          <AnalysisHistory
            onSelectDate={loadDateReviews}
            currentSelectedDate={selectedDate}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-600">
            생활가전 쇼핑몰 「하루살림」 마케팅팀 · 「클린핏 미니」 AI 리뷰 분석 대시보드
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Gemini 3.8 Flash (503 자동 폴백: 3.5 Flash Lite) & 한국소비자원 위해정보 공공 API 연동
          </p>
        </div>
      </footer>
    </div>
  );
}
