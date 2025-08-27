export interface Categoria {
  id: number;
  nombre: string;
  color: string;
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
  { id: 1, nombre: 'Categoría 1', color: '#ef4444' },
  { id: 2, nombre: 'Categoría 2', color: '#f97316' },
  { id: 3, nombre: 'Categoría 3', color: '#eab308' },
  { id: 4, nombre: 'Categoría 4', color: '#22c55e' },
  { id: 5, nombre: 'Categoría 5', color: '#3b82f6' },
  { id: 6, nombre: 'Categoría 6', color: '#a855f7' }
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
export const getPinchos = (): Pincho[] => {
  const pinchos = localStorage.getItem(STORAGE_KEYS.PINCHOS);
  return pinchos ? JSON.parse(pinchos) : [];
};

export const savePinchos = (pinchos: Pincho[]): void => {
  localStorage.setItem(STORAGE_KEYS.PINCHOS, JSON.stringify(pinchos));
};

export const createPincho = (pincho: Omit<Pincho, 'id' | 'valoraciones'>): Pincho => {
  const newPincho: Pincho = {
    ...pincho,
    id: Date.now().toString(),
    valoraciones: []
  };
  const pinchos = getPinchos();
  pinchos.push(newPincho);
  savePinchos(pinchos);
  return newPincho;
};

export const updatePincho = (id: string, updates: Partial<Omit<Pincho, 'id' | 'valoraciones'>>): Pincho | null => {
  const pinchos = getPinchos();
  const index = pinchos.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  pinchos[index] = { ...pinchos[index], ...updates };
  savePinchos(pinchos);
  return pinchos[index];
};

export const deletePincho = (id: string): boolean => {
  const pinchos = getPinchos();
  const filteredPinchos = pinchos.filter(p => p.id !== id);
  if (filteredPinchos.length === pinchos.length) return false;
  
  savePinchos(filteredPinchos);
  return true;
};

// Valoracion functions
export const addValoracion = (pinchoId: string, valoracion: Omit<Valoracion, 'id' | 'usuario'>): Valoracion | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const pinchos = getPinchos();
  const pincho = pinchos.find(p => p.id === pinchoId);
  if (!pincho) return null;

  const today = new Date().toDateString();
  const existingToday = pincho.valoraciones.find(v => 
    new Date(v.fecha).toDateString() === today && v.usuario === currentUser
  );
  
  if (existingToday) {
    throw new Error('Ya has valorado este pincho hoy');
  }

  const newValoracion: Valoracion = {
    ...valoracion,
    id: Date.now().toString(),
    usuario: currentUser
  };

  pincho.valoraciones.push(newValoracion);
  savePinchos(pinchos);
  return newValoracion;
};

export const canUserRate = (pinchoId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const pinchos = getPinchos();
  const pincho = pinchos.find(p => p.id === pinchoId);
  if (!pincho) return false;

  const today = new Date().toDateString();
  const existingToday = pincho.valoraciones.find(v => 
    new Date(v.fecha).toDateString() === today && v.usuario === currentUser
  );
  
  return !existingToday;
};

// Categoria functions
export const getCategorias = (): Categoria[] => {
  const categorias = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
  return categorias ? JSON.parse(categorias) : DEFAULT_CATEGORIAS;
};

export const saveCategorias = (categorias: Categoria[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
};

export const updateCategoria = (id: number, updates: Partial<Omit<Categoria, 'id'>>): Categoria | null => {
  const categorias = getCategorias();
  const index = categorias.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  categorias[index] = { ...categorias[index], ...updates };
  saveCategorias(categorias);
  return categorias[index];
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