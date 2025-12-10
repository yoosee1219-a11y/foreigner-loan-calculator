const API_BASE = "/api";

// 토큰 저장/로드 (LocalStorage 사용)
const TOKEN_KEY = "korea_usim_guide_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// 토큰 발급 (초기 로드 시 호출)
export async function getAuthToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Failed to get auth token");
    }

    const data = await response.json();
    const token = data.token;
    
    if (token) {
      setToken(token);
    }
    
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
}

// POST 요청 헬퍼 (토큰 자동 포함)
export async function apiPost<T = any>(endpoint: string, body: any = {}): Promise<T> {
  let token = getToken();

  // 토큰이 없으면 먼저 발급받기
  if (!token) {
    try {
      token = await getAuthToken();
    } catch (error) {
      console.error("Failed to get token:", error);
      throw new Error("Authentication failed");
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // 토큰 만료 또는 무효 - 다시 발급 시도
      removeToken();
      try {
        token = await getAuthToken();
        // 재시도
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        return retryResponse.json();
      } catch (error) {
        console.error("Retry failed:", error);
        throw new Error("Authentication failed");
      }
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

