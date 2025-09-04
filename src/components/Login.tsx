import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import laurelLogo from '@/assets/laureados-logo.png';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Test simple login first
      const simpleResult = await api.simpleLogin(email, password);
      console.log('Simple login result:', simpleResult);
      
      await api.login(email, password);
      {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        onLoginSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales incorrectas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src={laurelLogo} 
            alt="Laureados Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary">Laureados TEST</h1>
          <p className="text-muted-foreground mt-2">Gestión de pinchos y valoraciones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  placeholder="usuario@laurelados.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  placeholder="Introduce tu contraseña"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Acceder'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-xs text-center text-muted-foreground">
          <p>Credenciales válidas:</p>
          <p>roberto@laurelados.com / laurelados</p>
          <p>endika@laurelados.com / laurelados</p>
        </div>
      </div>
    </div>
  );
};