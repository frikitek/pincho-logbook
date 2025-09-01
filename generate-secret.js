// Script para generar un JWT_SECRET seguro
import crypto from 'crypto';

// Generar un secreto aleatorio de 64 caracteres
const secret = crypto.randomBytes(32).toString('hex');

console.log('🔐 JWT_SECRET generado:');
console.log(secret);
console.log('\n📋 Copia este valor y úsalo en Railway como JWT_SECRET');
console.log('\n⚠️  IMPORTANTE:');
console.log('- Guarda este secreto en un lugar seguro');
console.log('- No lo compartas ni lo subas a GitHub');
console.log('- Usa el mismo secreto en todos los entornos (desarrollo, producción)');
