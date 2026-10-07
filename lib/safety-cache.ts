import { HarmInjuryStat, SafetyHarmResponse } from './types';

// In-memory cache with 24-hour expiration
interface CacheEntry {
  data: SafetyHarmResponse;
  expiresAt: number;
}

let cachedHarmData: CacheEntry | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchConsumerSafetyHarmData(providedApiKey?: string): Promise<SafetyHarmResponse> {
  const now = Date.now();

  // Return cached result if valid (24-hour cache requirement)
  if (cachedHarmData && cachedHarmData.expiresAt > now) {
    return {
      ...cachedHarmData.data,
      cachedAt: new Date(cachedHarmData.expiresAt - CACHE_DURATION_MS).toISOString(),
    };
  }

  const apiKey = (providedApiKey || process.env.CONSUMER_SAFETY_API_KEY || '').trim();

  if (!apiKey) {
    return {
      totalCollected: 0,
      vacuumCount: 0,
      topReasons: [],
      error: '불러오지 못했습니다',
    };
  }

  const endpoint = 'https://apis.data.go.kr/B551919/open-api/harm/reception';

  try {
    // Collect 3 pages, 1,000 items each = 3,000 items total
    // Parameters restricted to: serviceKey, pageNo, numOfRows, apiFormat=json
    const decodedKey = decodeURIComponent(apiKey);
    const encodedKey = encodeURIComponent(decodedKey);

    const pagePromises = [1, 2, 3].map(async (pageNo) => {
      const url = `${endpoint}?serviceKey=${encodedKey}&pageNo=${pageNo}&numOfRows=1000&apiFormat=json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`Safety API page ${pageNo} returned status ${response.status}`);
        return [];
      }

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        return [];
      }

      const items =
        data?.response?.body?.items?.item ||
        data?.response?.body?.items ||
        data?.body?.items?.item ||
        data?.body?.items ||
        data?.items ||
        [];

      return Array.isArray(items) ? items : items ? [items] : [];
    });

    const pageResults = await Promise.all(pagePromises);
    const allHarmItems = pageResults.flat();

    if (allHarmItems.length === 0) {
      return {
        totalCollected: 0,
        vacuumCount: 0,
        topReasons: [],
        error: '불러오지 못했습니다',
      };
    }

    // Filter by itemMinor == "가정용 진공청소기"
    const vacuumIncidents = allHarmItems.filter(
      (item) => item?.itemMinor?.trim() === '가정용 진공청소기' || item?.itemMinor?.includes('진공청소기')
    );

    // Group by injuryReason and count
    const reasonCounts: Record<string, number> = {};
    for (const incident of vacuumIncidents) {
      const reason = incident?.injuryReason?.trim() || '기타 / 미상';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    }

    const sortedReasons = Object.entries(reasonCounts)
      .map(([injuryReason, count]) => ({
        injuryReason,
        count,
        percentage: vacuumIncidents.length > 0 ? Math.round((count / vacuumIncidents.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Top 3 injury reasons
    const topReasons: HarmInjuryStat[] = sortedReasons.slice(0, 3);

    const result: SafetyHarmResponse = {
      totalCollected: allHarmItems.length,
      vacuumCount: vacuumIncidents.length,
      topReasons,
      cachedAt: new Date(now).toISOString(),
    };

    // Cache for 24 hours
    cachedHarmData = {
      data: result,
      expiresAt: now + CACHE_DURATION_MS,
    };

    return result;
  } catch (error: any) {
    console.error('Error fetching consumer safety harm data:', error);
    return {
      totalCollected: 0,
      vacuumCount: 0,
      topReasons: [],
      error: '불러오지 못했습니다',
    };
  }
}
