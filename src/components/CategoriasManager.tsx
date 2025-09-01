import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

interface Categoria {
  id: number;
  nombre: string;
  color: string;
  nivel: number;
}

export const CategoriasManager = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ nombre: '', color: '', nivel: 1 });
  const { toast } = useToast();

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await apiService.getCategorias();
      setCategorias(data.sort((a: Categoria, b: Categoria) => a.nivel - b.nivel));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setEditData({ nombre: categoria.nombre, color: categoria.color, nivel: categoria.nivel });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      await apiService.updateCategoria(editingId, editData);
      await loadCategorias();
      setEditingId(null);
      toast({
        title: "Categoría actualizada",
        description: `"${editData.nombre}" ha sido actualizada correctamente.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ nombre: '', color: '', nivel: 1 });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Gestión de Categorías
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categorias.map(categoria => (
            <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: categoria.color }}
                />
                <div>
                  <h3 className="font-medium">{categoria.nombre}</h3>
                  <p className="text-sm text-muted-foreground">Nivel {categoria.nivel}</p>
                </div>
              </div>
              
              {editingId === categoria.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editData.nombre}
                    onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-32"
                    placeholder="Nombre"
                  />
                  <Input
                    type="color"
                    value={editData.color}
                    onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editData.nivel}
                    onChange={(e) => setEditData(prev => ({ ...prev, nivel: parseInt(e.target.value) }))}
                    className="w-16"
                    placeholder="Nivel"
                  />
                  <Button size="sm" onClick={handleSave}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(categoria)}
                >
                  Editar
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};