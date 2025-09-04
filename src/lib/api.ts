const API_URL = import.meta.env.VITE_API_URL || 'https://pincho-logbook.vercel.app/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function getAuthToken(): string | null {
  if (!authToken) authToken = localStorage.getItem('auth_token');
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const token = getAuthToken();
  const url = `${API_URL}${path}`;
  
  console.log('Making request:', {
    url,
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  });

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log('Response received:', {
    status: res.status,
    statusText: res.statusText,
    url: res.url
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('API Error Response:', {
      status: res.status,
      statusText: res.statusText,
      data: data
    });
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // Pinchos
  getPinchos: () => request<{ pinchos: any[] } | any[]>('/pinchos'),
  createPincho: (payload: any) => {
    const body = {
      nombre: payload.nombre,
      bar: payload.bar,
      precio: payload.precio,
      categoria_id: payload.categoria ?? payload.categoria_id,
      foto_url: payload.foto ?? payload.foto_url ?? null,
    };
    return request<any>('/pinchos', 'POST', body);
  },
  updatePincho: (id: string, payload: any) => {
    const body = {
      nombre: payload.nombre,
      bar: payload.bar,
      precio: payload.precio,
      categoria_id: payload.categoria ?? payload.categoria_id,
      foto_url: payload.foto ?? payload.foto_url ?? null,
    };
    return request<any>(`/pinchos/${id}`, 'PUT', body);
  },
  deletePincho: (id: string) => request<any>(`/pinchos/${id}`, 'DELETE'),

  // Categorias
  getCategorias: () => request<{ categorias: any[] } | any[]>('/categorias'),
  updateCategoria: (id: number, payload: any) => request<any>(`/categorias/${id}`, 'PUT', payload),

  // Valoraciones
  addValoracion: (payload: any) => request<any>('/valoraciones', 'POST', payload),
  canRate: (pinchoId: string) => request<{ canRate: boolean }>(`/valoraciones/can-rate/${pinchoId}`),

  // Auth
  testDb: async () => {
    console.log('API test DB called');
    const data = await request<{ message: string; userCount: number }>('/auth/test-db', 'GET');
    return data;
  },
  testLogin: async (email: string, password: string) => {
    console.log('API test login called with:', { email, password });
    const data = await request<{ message: string; method: string }>('/auth/test-login', 'POST', { email, password });
    return data;
  },
  login: async (email: string, password: string) => {
    console.log('API login called with:', { email, password });
    const data = await request<{ token: string; user: any }>('/auth/login', 'POST', { email, password });
    setAuthToken(data.token);
    return data;
  },
  me: () => request('/auth/me'),
  logout: () => clearAuthToken(),
};


