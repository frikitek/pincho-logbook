export interface Categoria {
  id: number;
  nombre: string;
  color: string;
  nivel: number; // Campo para ordenar de mejor a peor
}

export interface Pincho {
  id: string;
  nombre: string;
  bar: string;
  precio: number;
  categoria: number; // 1-6
  foto?: string;
  valoraciones: Valoracion[];
}

export interface Valoracion {
  id: string;
  fecha: string; // ISO date string
  nota: number; // 1-5
  comentario?: string;
  usuario: string; // email del usuario que valoró
}

export interface User {
  email: string;
  password: string;
}

const STORAGE_KEYS = {
  PINCHOS: 'laureados_pinchos',
  AUTH: 'laureados_auth',
  CATEGORIAS: 'laureados_categorias'
};

const DEFAULT_CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Excelente', color: '#22c55e', nivel: 1 },
  { id: 2, nombre: 'Muy Bueno', color: '#3b82f6', nivel: 2 },
  { id: 3, nombre: 'Bueno', color: '#eab308', nivel: 3 },
  { id: 4, nombre: 'Regular', color: '#f97316', nivel: 4 },
  { id: 5, nombre: 'Malo', color: '#ef4444', nivel: 5 },
  { id: 6, nombre: 'Muy Malo', color: '#a855f7', nivel: 6 }
];

const VALID_USERS: User[] = [
  { email: 'roberto@laurelados.com', password: 'laurelados' },
  { email: 'endika@laurelados.com', password: 'laurelados' }
];

// Auth functions
export const authenticate = (email: string, password: string): boolean => {
  const user = VALID_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ email, timestamp: Date.now() }));
    return true;
  }
  return false;
};

export const isAuthenticated = (): boolean => {
  const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
  return !!auth;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
};

export const getCurrentUser = (): string | null => {
  const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!auth) return null;
  try {
    const { email } = JSON.parse(auth);
    return email;
  } catch {
    return null;
  }
};

// Pincho CRUD functions
import { api } from './api';

export const getPinchos = async (): Promise<Pincho[]> => {
  const res = await api.getPinchos();
  // API can return { pinchos } or array directly depending on backend
  const list = Array.isArray(res) ? res : (res as any).pinchos;
  return (list ?? []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    bar: p.bar,
    precio: Number(p.precio) || 0,
    categoria: p.categoria,
    foto: p.foto || undefined,
    valoraciones: p.valoraciones || [],
  }));
};

export const savePinchos = (_pinchos: Pincho[]): void => {
  // No-op: persist handled by backend
};

export const createPincho = async (pincho: Omit<Pincho, 'id' | 'valoraciones'>): Promise<Pincho> => {
  const created = await api.createPincho(pincho);
  return {
    id: created.id,
    nombre: created.nombre,
    bar: created.bar,
    precio: Number(created.precio) || 0,
    categoria: created.categoria,
    foto: created.foto || undefined,
    valoraciones: created.valoraciones || [],
  };
};

export const updatePincho = async (id: string, updates: Partial<Omit<Pincho, 'id' | 'valoraciones'>>): Promise<Pincho | null> => {
  const updated = await api.updatePincho(id, updates);
  return updated
    ? {
        id: updated.id,
        nombre: updated.nombre,
        bar: updated.bar,
        precio: Number(updated.precio) || 0,
        categoria: updated.categoria,
        foto: updated.foto || undefined,
        valoraciones: updated.valoraciones || [],
      }
    : null;
};

export const deletePincho = async (id: string): Promise<boolean> => {
  await api.deletePincho(id);
  return true;
};

// Valoracion functions
export const addValoracion = async (pinchoId: string, valoracion: Omit<Valoracion, 'id' | 'usuario'>): Promise<Valoracion | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  const created = await api.addValoracion({
    pincho_id: pinchoId,
    fecha: valoracion.fecha,
    nota: valoracion.nota,
    comentario: valoracion.comentario ?? undefined,
    usuario: currentUser,
  });
  return {
    id: created.id,
    fecha: created.fecha,
    nota: created.nota,
    comentario: created.comentario ?? undefined,
    usuario: created.usuario,
  };
};

export const canUserRate = async (pinchoId: string): Promise<boolean> => {
  const res = await api.canRate(pinchoId);
  return !!res?.canRate;
};

// Categoria functions
export const getCategorias = async (): Promise<Categoria[]> => {
  const res = await api.getCategorias();
  const list = Array.isArray(res) ? res : (res as any).categorias;
  return (list ?? DEFAULT_CATEGORIAS) as Categoria[];
};

export const getCategoriasOrdenadas = (): Categoria[] => {
  const categorias = getCategorias();
  return categorias.sort((a, b) => a.nivel - b.nivel);
};

export const getCategoriaById = (id: number): Categoria | null => {
  const categorias = getCategorias();
  return categorias.find(c => c.id === id) || null;
};

export const saveCategorias = (categorias: Categoria[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
};

export const updateCategoria = async (id: number, updates: Partial<Omit<Categoria, 'id'>>): Promise<Categoria | null> => {
  const updated = await api.updateCategoria(id, updates);
  return updated ?? null;
};

// Export/Import functions
export const exportData = (): string => {
  const data = {
    pinchos: getPinchos(),
    categorias: getCategorias(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.pinchos && Array.isArray(data.pinchos)) {
      savePinchos(data.pinchos);
      if (data.categorias && Array.isArray(data.categorias)) {
        saveCategorias(data.categorias);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
};