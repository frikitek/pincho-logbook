const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
  }

  // Pinchos endpoints
  async getPinchos() {
    const response = await this.request('/pinchos');
    return response.pinchos || [];
  }

  async createPincho(pinchoData: any) {
    return this.request('/pinchos', {
      method: 'POST',
      body: JSON.stringify(pinchoData),
    });
  }

  async updatePincho(id: string, pinchoData: any) {
    return this.request(`/pinchos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pinchoData),
    });
  }

  async deletePincho(id: string) {
    return this.request(`/pinchos/${id}`, {
      method: 'DELETE',
    });
  }

  // Categorías endpoints
  async getCategorias() {
    const response = await this.request('/categorias');
    return response.categorias || [];
  }

  async updateCategoria(id: number, categoriaData: any) {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
    });
  }

  // Valoraciones endpoints
  async addValoracion(valoracionData: any) {
    return this.request('/valoraciones', {
      method: 'POST',
      body: JSON.stringify(valoracionData),
    });
  }

  async canRate(pinchoId: string) {
    const response = await this.request(`/valoraciones/can-rate/${pinchoId}`);
    return response.canRate || false;
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
