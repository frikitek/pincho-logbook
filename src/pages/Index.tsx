import { useState, useEffect } from 'react';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import { PinchoList } from '@/components/PinchoList';
import { PinchoForm } from '@/components/PinchoForm';
import { CategoriasManager } from '@/components/CategoriasManager';
import { isAuthenticated, getPinchos, exportData, importData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [pinchos, setPinchos] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    loadPinchos();
  }, []);

  const loadPinchos = () => {
    setPinchos(getPinchos());
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentView('list');
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laureados-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados",
        description: "La copia de seguridad se ha descargado correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive"
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            const success = importData(data);
            if (success) {
              loadPinchos();
              toast({
                title: "Datos importados",
                description: "Los datos se han importado correctamente."
              });
            } else {
              throw new Error('Invalid data format');
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "El archivo no es válido o está corrupto.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSync = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laureados-sync-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados para sincronización",
        description: "Descarga el archivo y compártelo con otros dispositivos para sincronizar."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos para sincronización.",
        variant: "destructive"
      });
    }
  };

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
      onExport={handleExport}
      onImport={handleImport}
      onSync={handleSync}
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default Index;
