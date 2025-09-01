import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, List, Settings } from 'lucide-react';
import { apiService } from '@/services/api';
import laurelLogo from '@/assets/laureados-logo.png';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout = ({ 
  children, 
  onLogout, 
  currentView, 
  onNavigate
}: LayoutProps) => {
  const handleLogout = () => {
    apiService.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={laurelLogo} 
                alt="Laureados" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold">Laureados</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-1 py-2">
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('list')}
              className="flex-shrink-0"
            >
              <List className="h-4 w-4 mr-2" />
              Pinchos
            </Button>
            <Button
              variant={currentView === 'create' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('create')}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
            <Button
              variant={currentView === 'categorias' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('categorias')}
              className="flex-shrink-0"
            >
              <Settings className="h-4 w-4 mr-2" />
              Categorías
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};