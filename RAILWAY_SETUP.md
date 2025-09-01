# 🚂 Configuración Railway - Laureados Pincho Logbook

## 📋 Pasos para desplegar en Railway

### 1. Crear cuenta en Railway
1. Ve a https://railway.app
2. Inicia sesión con tu cuenta de GitHub
3. No necesitas tarjeta de crédito para empezar

### 2. Crear nuevo proyecto
1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `pincho-logbook-main`

### 3. Crear los 3 servicios

#### Servicio 1: Base de datos PostgreSQL
1. En tu proyecto Railway, haz clic en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. **Guarda la URL de conexión** que aparece en Variables

#### Servicio 2: Backend API
1. Haz clic en "New Service"
2. Selecciona "GitHub Repo"
3. Selecciona tu repositorio
4. En "Root Directory" escribe: `server`
5. Railway detectará automáticamente que es Node.js

#### Servicio 3: Frontend
1. Haz clic en "New Service"
2. Selecciona "GitHub Repo"
3. Selecciona tu repositorio
4. Deja "Root Directory" vacío (carpeta raíz)
5. Railway detectará automáticamente que es React

### 4. Configurar variables de entorno

#### Para el Backend:
1. Ve al servicio Backend
2. Haz clic en "Variables"
3. Agrega estas variables:

```bash
DATABASE_URL=postgresql://... (copiar desde el servicio PostgreSQL)
JWT_SECRET=tu-super-secret-jwt-key-aqui-muy-largo-y-seguro
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.railway.app
```

#### Para el Frontend:
1. Ve al servicio Frontend
2. Haz clic en "Variables"
3. Agrega esta variable:

```bash
VITE_API_URL=https://tu-backend.railway.app
```

### 5. Configurar la base de datos
1. Ve al servicio PostgreSQL
2. Haz clic en "Connect" → "PostgreSQL"
3. Se abrirá una consola web
4. Copia y pega el contenido de `database/schema.sql`
5. Ejecuta el script

### 6. Verificar el despliegue
1. Ve a cada servicio y verifica que esté "Deployed"
2. Haz clic en el dominio del Frontend para ver tu app
3. Haz clic en el dominio del Backend para ver la API

## 🔗 URLs de ejemplo

Después del despliegue tendrás URLs como:
- **Frontend**: `https://laureados-frontend-production.up.railway.app`
- **Backend**: `https://laureados-backend-production.up.railway.app`
- **Base de datos**: Accesible desde el dashboard de Railway

## 🔄 Actualizar cambios

Para publicar cambios:
```bash
# 1. Hacer cambios en tu código local
# 2. Commit y push a GitHub
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# 3. Railway automáticamente:
# - Detecta el push
# - Reconstruye la aplicación
# - Despliega los cambios
# - Tu app está actualizada en segundos
```

## 🐛 Troubleshooting

### Si el backend no se conecta a la base de datos:
1. Verifica que `DATABASE_URL` esté correcta
2. Asegúrate de que el esquema SQL se haya ejecutado
3. Revisa los logs del backend

### Si el frontend no se conecta al backend:
1. Verifica que `VITE_API_URL` apunte al backend correcto
2. Asegúrate de que `CORS_ORIGIN` esté configurado
3. Revisa los logs del frontend

### Para ver logs:
1. Ve a cualquier servicio
2. Haz clic en "Deployments"
3. Selecciona el deployment más reciente
4. Revisa los logs

## 📊 Monitoreo

### Dashboard de Railway:
- **Logs en tiempo real** de todos los servicios
- **Métricas de uso** (CPU, memoria, ancho de banda)
- **Estado de salud** de cada servicio
- **Base de datos web** para ver/editar datos

### Health Check:
- Backend: `https://tu-backend.railway.app/api/health`
- Debería devolver: `{"status":"OK","timestamp":"...","environment":"production"}`

## 💰 Costos

### Plan gratuito ($5 crédito/mes):
- **Base de datos**: ~$0.50/mes
- **Backend**: ~$1/mes
- **Frontend**: ~$0.50/mes
- **Total**: ~$2/mes (dentro del límite gratuito)

### Solo pagarías si:
- Tienes miles de usuarios diarios
- Almacenas muchas fotos
- Excedes los límites del plan gratuito

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Asegúrate de que el esquema SQL se ejecutó
4. Contacta soporte de Railway si es necesario
