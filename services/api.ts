const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

interface CustomRequestOptions extends Omit<RequestInit, 'body'> {
  body?: FormData | object;
}

async function request<T>(path: string, options: CustomRequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('edmin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;

  if (options.body instanceof FormData) {
    requestBody = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: headers,
    body: requestBody,
    cache: 'no-store',
    credentials: 'omit',
    mode: 'cors',
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'İstek başarısız oldu');
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: FormData | object, headers?: Record<string, string>) =>
    request<T>(path, {
      method: 'POST',
      body: body,
      headers,
    }),
  put: <T>(path: string, body: FormData | object, headers?: Record<string, string>) =>
    request<T>(path, {
      method: 'PUT',
      body: body,
      headers,
    }),
  patch: <T>(path: string, body: FormData | object, headers?: Record<string, string>) =>
    request<T>(path, {
      method: 'PATCH',
      body: body,
      headers,
    }),
  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, {
      method: 'DELETE',
      headers,
    }),
};

export { API_URL, API_BASE_URL };
