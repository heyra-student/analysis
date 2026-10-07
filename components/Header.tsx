'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldAlert, KeyRound, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentModel?: string;
  onApiKeySave?: (geminiKey: string, safetyKey: string) => void;
  hasCustomGeminiKey?: boolean;
}

export default function Header({
  currentModel = 'gemini-3.8-flash (대기 중)',
  onApiKeySave,
  hasCustomGeminiKey = false,
}: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [safetyKeyInput, setSafetyKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApiKeySave) {
      onApiKeySave(geminiKeyInput.trim(), safetyKeyInput.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsModalOpen(false);
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                하루살림
              </span>
              <span className="text-xs font-medium text-slate-400">무선 청소기 VOC 대시보드</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              「클린핏 미니」 AI 리뷰 분석기
            </h1>
          </div>
        </div>

        {/* Right Info: Model Status & Key Setting */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-[11px] font-medium text-slate-400">적용 AI 모델</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {currentModel}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-sm"
            title="API 키 및 연동 설정"
          >
            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
            <span>API 설정</span>
            {hasCustomGeminiKey && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
            )}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">API 연동 키 설정</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKeys} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (미입력 시 .env.local 기본값 사용)"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  기본 모델 <code className="text-blue-600">gemini-3.8-flash</code> 호출에 사용됩니다. (503 오류 시 3.5-flash-lite 자동 폴백)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  한국소비자원 위해정보 API Key
                </label>
                <input
                  type="password"
                  placeholder="공공데이터포털 일반 인증키 (미입력 시 기본값 사용)"
                  value={safetyKeyInput}
                  onChange={(e) => setSafetyKeyInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  가정용 진공청소기 사고 통계(3,000건 수집 분석)에 사용됩니다.
                </p>
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>설정이 안전하게 적용되었습니다!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  저장 및 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
