'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Copy, Check, Save, UserCheck, AlertCircle } from 'lucide-react';

export default function ActionPlanCard() {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cleanfit_action_plan');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLine1(parsed.line1 || '');
        setLine2(parsed.line2 || '');
        setLine3(parsed.line3 || '');
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        'cleanfit_action_plan',
        JSON.stringify({ line1, line2, line3, updatedAt: new Date().toISOString() })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleCopy = () => {
    const textToCopy = `[하루살림 마케팅팀] 「클린핏 미니」 VOC 기반 핵심 개선 결론 (3줄)
1. ${line1 || '(미작성)'}
2. ${line2 || '(미작성)'}
3. ${line3 || '(미작성)'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-indigo-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                마케팅팀 직접 작성
              </span>
              <span className="text-xs text-slate-500">담당자 판단 및 최종 의사결정</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              「우리가 고칠 것」 최종 결론 3줄 (Action Plan)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            {saved ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Save className="h-3.5 w-3.5 text-slate-500" />}
            <span>{saved ? '저장 완료' : '내용 저장'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? '복사됨!' : '카톡/보고서 복사'}</span>
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/70 flex items-start gap-2">
        <UserCheck className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">정책 준수 안내:</strong> 최종 결론 3줄은 마케팅팀 담당자가 위의 감성·불만유형·안전이슈 분석 결과를 종합 검토하여 <strong>직접 작성</strong>합니다. (시스템 자동생성 배제 원칙)
        </div>
      </div>

      {/* 3 Action Item Inputs */}
      <div className="mt-4 space-y-3">
        {/* Line 1 */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
            1
          </span>
          <input
            type="text"
            placeholder="첫 번째 개선 항목을 입력하세요 (예: 충전기 어댑터 KC 인증 및 발열 규격 즉시 재점검)"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Line 2 */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
            2
          </span>
          <input
            type="text"
            placeholder="두 번째 개선 항목을 입력하세요 (예: 상세페이지 내 배터리 실사용시간(강모드 8분) 크고 명확하게 표기)"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Line 3 */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
            3
          </span>
          <input
            type="text"
            placeholder="세 번째 개선 항목을 입력하세요 (예: 한글 설명서 동봉 및 거치대 기본 사은품 프로모션 검토)"
            value={line3}
            onChange={(e) => setLine3(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
