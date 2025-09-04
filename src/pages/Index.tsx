import { useState, useEffect } from 'react';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import { PinchoList } from '@/components/PinchoList';
import { PinchoForm } from '@/components/PinchoForm';
import { CategoriasManager } from '@/components/CategoriasManager';
import { isAuthenticated, getPinchos } from '@/lib/storage';

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [pinchos, setPinchos] = useState<any[]>([]);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    loadPinchos();
  }, []);

  const loadPinchos = async () => {
    const data = await getPinchos();
    setPinchos(data);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentView('list');
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
    >
      {renderCurrentView()}
    </Layout>
  );
};

export default Index;
