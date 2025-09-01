# 🚀 Guía de Despliegue - Laureados Pincho Logbook

## 📋 Resumen del Proyecto

Este proyecto consiste en:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Autenticación**: JWT
- **Base de datos**: PostgreSQL

## 🎯 Opciones de Despliegue Recomendadas

### Opción 1: Vercel + Supabase (Recomendada)

#### Frontend (Vercel)
1. **Crear cuenta en Vercel**: https://vercel.com
2. **Conectar repositorio**:
   ```bash
   # En el directorio raíz del proyecto
   npm install -g vercel
   vercel login
   vercel
   ```
3. **Configurar variables de entorno** en Vercel:
   ```
   VITE_API_URL=https://tu-backend.vercel.app
   ```

#### Base de datos (Supabase)
1. **Crear cuenta en Supabase**: https://supabase.com
2. **Crear nuevo proyecto**
3. **Ejecutar el esquema SQL**:
   - Ir a SQL Editor
   - Copiar y ejecutar el contenido de `database/schema.sql`
4. **Obtener credenciales**:
   - Settings > Database > Connection string

#### Backend (Vercel)
1. **Crear archivo `vercel.json`** en la carpeta `server/`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.js"
       }
     ]
   }
   ```
2. **Configurar variables de entorno** en Vercel:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu-super-secret-jwt-key
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.vercel.app
   ```

### Opción 2: Railway (Todo en uno)

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio**
3. **Configurar servicios**:
   - **PostgreSQL**: Crear servicio de base de datos
   - **Backend**: Deploy desde carpeta `server/`
   - **Frontend**: Deploy desde carpeta raíz
4. **Configurar variables de entorno**

### Opción 3: Netlify + PlanetScale

#### Frontend (Netlify)
1. **Crear cuenta en Netlify**: https://netlify.com
2. **Conectar repositorio**
3. **Configurar build**:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Base de datos (PlanetScale)
1. **Crear cuenta en PlanetScale**: https://planetscale.com
2. **Crear base de datos**
3. **Ejecutar esquema SQL** (adaptar para MySQL)

## 🔧 Configuración Local para Desarrollo

### 1. Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configurar base de datos local

```bash
# Instalar PostgreSQL
# En Windows: https://www.postgresql.org/download/windows/
# En macOS: brew install postgresql
# En Ubuntu: sudo apt-get install postgresql

# Crear base de datos
createdb laureados_db

# Ejecutar esquema
psql -d laureados_db -f database/schema.sql
```

### 3. Configurar variables de entorno

```bash
# Crear archivo .env en la carpeta server/
cp env.example server/.env

# Editar .env con tus credenciales
DATABASE_URL=postgresql://username:password@localhost:5432/laureados_db
JWT_SECRET=tu-super-secret-jwt-key-aqui
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

## 📱 Adaptación del Frontend para API

### 1. Crear servicio de API

Crear `src/services/api.ts`:

```typescript
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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
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

  // Pinchos endpoints
  async getPinchos() {
    return this.request('/pinchos');
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
    return this.request('/categorias');
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
    return this.request(`/valoraciones/can-rate/${pinchoId}`);
  }
}

export const apiService = new ApiService();
```

### 2. Actualizar componentes

Reemplazar las funciones de `storage.ts` con llamadas a la API.

## 🔒 Seguridad

### Variables de entorno críticas:
- `JWT_SECRET`: Clave secreta para JWT (mínimo 32 caracteres)
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `CORS_ORIGIN`: Origen permitido para CORS

### Recomendaciones:
- Usar HTTPS en producción
- Configurar rate limiting
- Validar todas las entradas
- Usar prepared statements (ya implementado)
- Configurar backup automático de la base de datos

## 📊 Monitoreo

### Health Check
La API incluye un endpoint de health check:
```
GET /api/health
```

### Logs
- Configurar logging en producción
- Monitorear errores y performance
- Usar servicios como Sentry para tracking de errores

## 🚀 Comandos de Despliegue

### Vercel
```bash
# Frontend
vercel --prod

# Backend
cd server
vercel --prod
```

### Railway
```bash
railway login
railway link
railway up
```

### Netlify
```bash
netlify deploy --prod
```

## 📞 Soporte

Para problemas de despliegue:
1. Verificar logs del servidor
2. Comprobar variables de entorno
3. Verificar conectividad de base de datos
4. Revisar CORS configuration

## 🔄 Migración de Datos

Para migrar datos existentes de localStorage:

1. Exportar datos actuales
2. Crear script de migración
3. Importar a la nueva base de datos PostgreSQL
