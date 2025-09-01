import { useState, useEffect } from 'react';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import { PinchoList } from '@/components/PinchoList';
import { PinchoForm } from '@/components/PinchoForm';
import { CategoriasManager } from '@/components/CategoriasManager';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [pinchos, setPinchos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiService.getToken();
      if (token) {
        await apiService.getMe();
        setAuthenticated(true);
        await loadPinchos();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.logout();
    } finally {
      setLoading(false);
    }
  };

  const loadPinchos = async () => {
    try {
      const data = await apiService.getPinchos();
      setPinchos(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pinchos: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    loadPinchos();
  };

  const handleLogout = () => {
    apiService.logout();
    setAuthenticated(false);
    setCurrentView('list');
    setPinchos([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <PinchoForm 
            onSuccess={() => {
              setCurrentView('list');
              loadPinchos();
            }} 
          />
        );
      case 'categorias':
        return <CategoriasManager />;
      case 'list':
      default:
        return <PinchoList pinchos={pinchos} onUpdate={loadPinchos} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default Index;
