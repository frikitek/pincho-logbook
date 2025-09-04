const API_URL = import.meta.env.VITE_API_URL || '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // Pinchos
  getPinchos: () => request<{ pinchos: any[] } | any[]>('/pinchos'),
  createPincho: (payload: any) => request<any>('/pinchos', 'POST', payload),
  updatePincho: (id: string, payload: any) => request<any>(`/pinchos/${id}`, 'PUT', payload),
  deletePincho: (id: string) => request<any>(`/pinchos/${id}`, 'DELETE'),

  // Categorias
  getCategorias: () => request<{ categorias: any[] } | any[]>('/categorias'),
  updateCategoria: (id: number, payload: any) => request<any>(`/categorias/${id}`, 'PUT', payload),

  // Valoraciones
  addValoracion: (payload: any) => request<any>('/valoraciones', 'POST', payload),
  canRate: (pinchoId: string) => request<{ canRate: boolean }>(`/valoraciones/can-rate/${pinchoId}`),
};


