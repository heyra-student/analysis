'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { RawReview } from '@/lib/types';

interface FileUploaderProps {
  onStartAnalysis: (reviews: RawReview[]) => Promise<void>;
  isAnalyzing: boolean;
  analysisProgress: string;
}

export default function FileUploader({
  onStartAnalysis,
  isAnalyzing,
  analysisProgress,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedReviews, setParsedReviews] = useState<RawReview[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setErrorMsg(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setErrorMsg('파일 내용이 비어 있습니다.');
        return;
      }
      parseContent(content, selectedFile.name);
    };
    reader.onerror = () => {
      setErrorMsg('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const parseContent = (content: string, fileName: string) => {
    try {
      if (fileName.endsWith('.csv') || content.includes(',')) {
        // Use PapaParse for CSV
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data as any[];
            const normalized: RawReview[] = [];

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              // Find matching fields even if BOM or slight variation exists
              const findField = (...keys: string[]) => {
                for (const key of keys) {
                  if (row[key] !== undefined) return row[key];
                  const entry = Object.entries(row).find(([k]) => k.trim().replace(/^\uFEFF/, '').toLowerCase() === key.toLowerCase());
                  if (entry && entry[1] !== undefined) return entry[1];
                }
                return undefined;
              };

              const noVal = findField('번호', 'no', 'id');
              const dateVal = findField('작성일', '날짜', 'date');
              const ratingVal = findField('별점', 'rating', '점수');
              const textVal = findField('리뷰', 'review', '내용', '리뷰내용');

              const no = Number(noVal || i + 1);
              const date = String(dateVal || '').trim();
              const rating = Number(ratingVal || 0);
              const text = String(textVal || '').trim();

              if (text) {
                normalized.push({
                  review_no: no,
                  written_on: date || new Date().toISOString().split('T')[0],
                  rating: isNaN(rating) ? 0 : rating,
                  review_text: text,
                });
              }
            }

            if (normalized.length === 0) {
              setErrorMsg('유효한 리뷰 데이터를 찾을 수 없습니다. (헤더: 번호, 작성일, 별점, 리뷰 확인 필요)');
              setParsedReviews([]);
            } else {
              setParsedReviews(normalized);
            }
          },
        });
      } else {
        // Line by line plain text parsing
        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const normalized: RawReview[] = lines.map((line, idx) => ({
          review_no: idx + 1,
          written_on: new Date().toISOString().split('T')[0],
          rating: 0,
          review_text: line,
        }));

        setParsedReviews(normalized);
      }
    } catch (err: any) {
      setErrorMsg('리뷰 파일 파싱 실패: ' + err.message);
      setParsedReviews([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-blue-600" />
            리뷰 데이터 업로드
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            .csv 또는 .txt 파일을 드래그하여 업로드하면 Gemini가 전체 리뷰를 일괄 분석합니다.
          </p>
        </div>
        {parsedReviews.length > 0 && (
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>총 {parsedReviews.length}건 준비 완료</span>
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[1.005]'
            : file
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 mb-3">
          {file ? (
            <FileText className="h-6 w-6 text-emerald-600" />
          ) : (
            <UploadCloud className="h-6 w-6 text-blue-600" />
          )}
        </div>

        {file ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB · {parsedReviews.length}건의 리뷰 추출됨 (클릭하여 다른 파일 선택)
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-700">
              이곳에 리뷰 파일(.csv, .txt)을 끌어다 놓으세요
            </p>
            <p className="text-xs text-slate-400 mt-1">
              또는 클릭하여 내 컴퓨터에서 파일 찾기
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Snippet & Submit */}
      {parsedReviews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 w-full sm:w-auto">
            <span className="font-semibold text-slate-800">미리보기 (첫 2건):</span>
            <ul className="mt-1 space-y-0.5 list-disc list-inside text-slate-500 max-w-xl truncate">
              {parsedReviews.slice(0, 2).map((r) => (
                <li key={r.review_no} className="truncate">
                  #{r.review_no} [{r.rating}점] {r.review_text}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onStartAnalysis(parsedReviews)}
            disabled={isAnalyzing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all ${
              isAnalyzing
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{analysisProgress || 'AI 일괄 분석 중...'}</span>
              </>
            ) : (
              <>
                <span>전체 {parsedReviews.length}건 AI 일괄 분석 시작</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
