import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '「클린핏 미니」 AI 리뷰 분석기 | 하루살림',
  description: '생활가전 쇼핑몰 하루살림의 무선 청소기 클린핏 미니 고객 리뷰 심층 AI 분석 및 소비자 위해 정보 연동 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
