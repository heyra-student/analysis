export interface RawReview {
  review_no: number;
  written_on: string;
  rating: number;
  review_text: string;
}

export type SentimentType = '긍정' | '부정' | '중립' | '광고';

export const VALID_CATEGORIES = [
  '배터리',
  '흡입력',
  '소음',
  '무게·사용감',
  '디자인',
  '관리·청소',
  '구성품',
  '품질·불량',
  '배송',
  '포장',
  '고객센터',
  '가격',
  '설명서',
  '기타'
] as const;

export type CategoryType = typeof VALID_CATEGORIES[number];

export interface AnalyzedReview {
  id?: number;
  analyzed_on: string; // YYYY-MM-DD
  review_no: number;
  written_on: string;
  rating: number;
  review_text: string;
  sentiment: SentimentType;
  categories: string; // Comma-separated or single category
  improvement_request: string | null;
  is_safety_issue: boolean;
  model_used: string;
}

export interface HarmInjuryStat {
  injuryReason: string;
  count: number;
  percentage: number;
}

export interface SafetyHarmResponse {
  totalCollected: number;
  vacuumCount: number;
  topReasons: HarmInjuryStat[];
  cachedAt?: string;
  error?: string;
}

export interface HistorySummary {
  analyzed_on: string;
  total_count: number;
  valid_count: number; // excluding 광고
  negative_count: number;
  negative_rate: number;
  safety_count: number;
  models: string[];
}
