import { AnalyzedReview, RawReview } from './types';

interface GeminiAnalysisResponse {
  results: AnalyzedReview[];
  modelUsed: string;
  error?: string;
}

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

export async function analyzeReviewsWithGemini(
  reviews: RawReview[],
  customApiKey?: string
): Promise<GeminiAnalysisResponse> {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    return {
      results: [],
      modelUsed: '없음',
      error: '불러오지 못했습니다 (Gemini API 키가 설정되지 않음)',
    };
  }

  const prompt = createSystemPrompt(reviews);

  // 1. Try Primary Model: gemini-3.8-flash
  try {
    const primaryResult = await callGeminiEndpoint(PRIMARY_MODEL, prompt, apiKey);
    if (primaryResult.status === 503) {
      console.warn(`Primary model ${PRIMARY_MODEL} returned 503. Initiating single fallback to ${FALLBACK_MODEL}...`);
      // 2. Fallback Model on 503: gemini-3.5-flash-lite
      const fallbackResult = await callGeminiEndpoint(FALLBACK_MODEL, prompt, apiKey);
      if (!fallbackResult.ok) {
        return {
          results: [],
          modelUsed: FALLBACK_MODEL,
          error: '불러오지 못했습니다',
        };
      }
      const parsed = parseGeminiResponse(fallbackResult.text, reviews, FALLBACK_MODEL);
      return {
        results: parsed,
        modelUsed: FALLBACK_MODEL,
      };
    }

    if (!primaryResult.ok) {
      console.error(`Gemini Primary call failed with status ${primaryResult.status}: ${primaryResult.text}`);
      return {
        results: [],
        modelUsed: PRIMARY_MODEL,
        error: '불러오지 못했습니다',
      };
    }

    const parsed = parseGeminiResponse(primaryResult.text, reviews, PRIMARY_MODEL);
    return {
      results: parsed,
      modelUsed: PRIMARY_MODEL,
    };
  } catch (error: any) {
    console.error('Gemini API call failed with exception:', error);
    return {
      results: [],
      modelUsed: PRIMARY_MODEL,
      error: '불러오지 못했습니다',
    };
  }
}

async function callGeminiEndpoint(model: string, prompt: string, apiKey: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  const rawText = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text: rawText,
  };
}

function createSystemPrompt(reviews: RawReview[]): string {
  const reviewsJson = JSON.stringify(reviews, null, 2);

  return `당신은 생활가전 쇼핑몰 「하루살림」의 무선 청소기 「클린핏 미니」 전문 AI 리뷰 분석기입니다.
제공된 전체 리뷰 데이터를 엄격한 기준에 따라 분석하여 JSON 배열 형태로 반환해야 합니다.

[엄격한 분류 기준]
1. 감성 (sentiment): "긍정", "부정", "중립", "광고" 중 하나
   - 별점이 아닌 **실제 리뷰 내용 기준**으로 판단합니다.
   - **반어법/비꼬는 표현은 반드시 "부정"**으로 분류합니다. (예: "배송 정말 빠르네요^^ 주문하고 딱 12일 만에 왔어요", "흡입력 대단하네요 먼지가 그대로 있어요" -> 부정)
   - 체험단, 원고료, 무상 제공, 서포터즈, 협찬, 할인 링크, 쿠폰 코드 등이 언급된 리뷰는 반드시 **"광고"**로 분류합니다. (광고는 추후 집계에서 제외됨)
   - 장점과 단점이 비슷하거나 사실 나열에 그친 경우 "중립"으로 분류합니다.

2. 불만/언급 유형 (categories):
   다음 목록 중 해당되는 항목을 찾아 쉼표(,)로 구분된 문자열로 작성합니다. 하나의 리뷰에 여러 주제가 포함된 경우 복수 유형을 모두 지정해야 합니다:
   - "배터리" (사용시간 짧음, 충전시간 길음, 배터리 방전 등)
   - "흡입력" (흡입력 약함, 머리카락/모래 못 빨아들임 등)
   - "소음" (소음 큼, 시끄러움, 고주파음 등)
   - "무게·사용감" (무거움, 손목 아픔, 그립감 등)
   - "디자인" (디자인, 색상, 외관 등)
   - "관리·청소" (먼지통 비우기 어려움, 필터 청소, 세척 등)
   - "구성품" (거치대 없음, 노즐 부족, 부속품 등)
   - "품질·불량" (걸쇠 부러짐, 작동 멈춤, 고장, 마감 불량 등)
   - "배송" (배송 지연, 오배송 등)
   - "포장" (박스 훼손, 포장 미흡 등)
   - "고객센터" (CS 불친절, 교환/환불 지연 등)
   - "가격" (가성비, 비쌈, 할인 정책 등)
   - "설명서" (한글 설명서 부재, 영문/중문만 제공, QR코드 불편 등)
   - "기타" (위 항목에 해당하지 않는 경우)

3. 개선 요청 (improvement_request):
   - 고객이 "~면 좋겠어요", "~해 주세요", "~바랍니다", "~있으면 좋겠다" 등의 형태로 건의하거나 개선을 바라는 요구사항 문장을 원문에서 추출하여 그대로 입력합니다.
   - 개선 요구사항이 전혀 없으면 null로 처리합니다.

4. 안전 이슈 (is_safety_issue): boolean (true / false)
   - "뜨거움", "뜨거워", "발열", "과열", "냄새", "탄내", "연기", "감전", "스파크", "폭발", "화재", "불꽃" 등의 위험/안전 키워드나 화상/감전 위험 정황이 언급된 경우 **무조건 true**로 지정합니다.
   - 그 외에는 false로 지정합니다.

[입력 리뷰 데이터]:
${reviewsJson}

[출력 포맷]:
반드시 아래 키를 가진 JSON 객체들의 배열만 반환하세요:
[
  {
    "review_no": 1,
    "sentiment": "긍정" | "부정" | "중립" | "광고",
    "categories": "흡입력, 무게·사용감",
    "improvement_request": "거치대가 기본 제공되면 좋겠어요" | null,
    "is_safety_issue": true | false
  },
  ...
]`;
}

function parseGeminiResponse(rawResponseText: string, originalReviews: RawReview[], modelUsed: string): AnalyzedReview[] {
  const today = new Date().toISOString().split('T')[0];

  try {
    const jsonParsed = JSON.parse(rawResponseText);
    const candidates = jsonParsed?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates in Gemini response');
    }

    const contentText = candidates[0]?.content?.parts?.[0]?.text;
    if (!contentText || !contentText.trim()) {
      throw new Error('Empty content in Gemini response');
    }

    let parsedList: any[] = [];
    try {
      parsedList = JSON.parse(contentText);
    } catch {
      // If code fences exist, extract JSON
      const jsonMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedList = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse inner JSON');
      }
    }

    if (!Array.isArray(parsedList)) {
      throw new Error('Parsed response is not an array');
    }

    // Map each original review with AI analysis
    const reviewMap = new Map<number, any>();
    for (const item of parsedList) {
      const rNo = Number(item.review_no);
      if (!isNaN(rNo)) {
        reviewMap.set(rNo, item);
      }
    }

    return originalReviews.map((orig) => {
      const aiItem = reviewMap.get(orig.review_no);
      if (!aiItem) {
        // Fallback for safety keyword check if AI omitted single review
        const safetyKeywords = ['뜨거', '발열', '과열', '냄새', '탄내', '연기', '감전', '스파크', '화재'];
        const hasSafety = safetyKeywords.some((kw) => orig.review_text.includes(kw));

        return {
          analyzed_on: today,
          review_no: orig.review_no,
          written_on: orig.written_on,
          rating: orig.rating,
          review_text: orig.review_text,
          sentiment: '중립',
          categories: '기타',
          improvement_request: null,
          is_safety_issue: hasSafety,
          model_used: modelUsed,
        };
      }

      // Check safety keyword guarantee
      const safetyKeywords = ['뜨거', '발열', '과열', '냄새', '탄내', '연기', '감전', '스파크', '화재'];
      const forceSafety = safetyKeywords.some((kw) => orig.review_text.includes(kw));

      return {
        analyzed_on: today,
        review_no: orig.review_no,
        written_on: orig.written_on,
        rating: orig.rating,
        review_text: orig.review_text,
        sentiment: (aiItem.sentiment || '중립') as any,
        categories: Array.isArray(aiItem.categories)
          ? aiItem.categories.join(', ')
          : String(aiItem.categories || '기타'),
        improvement_request: aiItem.improvement_request ? String(aiItem.improvement_request).trim() : null,
        is_safety_issue: Boolean(aiItem.is_safety_issue || forceSafety),
        model_used: modelUsed,
      };
    });
  } catch (err: any) {
    console.error('Error parsing Gemini response:', err);
    throw err;
  }
}
