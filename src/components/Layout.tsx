import { ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, List, Download, Upload, Settings, RefreshCw, Share2 } from 'lucide-react';
import { logout, importData } from '@/lib/storage';
import laurelLogo from '@/assets/laureados-logo.png';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onSync: () => void;
}

export const Layout = ({ 
  children, 
  onLogout, 
  currentView, 
  onNavigate, 
  onExport, 
  onImport,
  onSync
}: LayoutProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

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
            <Button
              variant="ghost"
              size="sm"
              onClick={onSync}
              className="flex-shrink-0"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
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