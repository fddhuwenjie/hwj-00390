const BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const result = await response.json().catch(() => ({})) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.error || `请求失败，状态码 ${response.status}`);
  }

  return result.data;
}

export function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }
  return request<T>(fullUrl, { method: 'GET' });
}

export function apiPost<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut<T>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }
  return request<T>(fullUrl, { method: 'DELETE' });
}
