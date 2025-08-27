import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, List, Download, Upload, Settings } from 'lucide-react';
import { logout, importData } from '@/lib/storage';
import laurelLogo from '@/assets/laureados-logo.png';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export const Layout = ({ 
  children, 
  onLogout, 
  currentView, 
  onNavigate, 
  onExport, 
  onImport 
}: LayoutProps) => {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const success = importData(reader.result as string);
            if (success) {
              alert('Datos importados correctamente');
              window.location.reload();
            } else {
              alert('Error: Archivo JSON no válido');
            }
          } catch (error) {
            alert('Error al leer el archivo');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImportClick}
              className="flex-shrink-0"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
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