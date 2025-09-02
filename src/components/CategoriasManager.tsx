import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Categoria, getCategoriasOrdenadas, updateCategoria } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

export const CategoriasManager = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ nombre: '', color: '', nivel: 1 });
  const { toast } = useToast();

  useEffect(() => {
    setCategorias(getCategoriasOrdenadas());
  }, []);

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setEditData({ nombre: categoria.nombre, color: categoria.color, nivel: categoria.nivel });
  };

  const handleSave = () => {
    if (!editingId) return;
    
    const updated = updateCategoria(editingId, editData);
    if (updated) {
      setCategorias(getCategoriasOrdenadas());
      setEditingId(null);
      toast({
        title: "Categoría actualizada",
        description: `"${editData.nombre}" ha sido actualizada correctamente.`
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
        <div className="grid gap-4">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: categoria.color }}
              />
              
              {editingId === categoria.id ? (
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`nombre-${categoria.id}`}>Nombre</Label>
                      <Input
                        id={`nombre-${categoria.id}`}
                        value={editData.nombre}
                        onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre de la categoría"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`color-${categoria.id}`}>Color</Label>
                      <Input
                        id={`color-${categoria.id}`}
                        type="color"
                        value={editData.color}
                        onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`nivel-${categoria.id}`}>Nivel</Label>
                      <Input
                        id={`nivel-${categoria.id}`}
                        type="number"
                        min="1"
                        max="10"
                        value={editData.nivel}
                        onChange={(e) => setEditData(prev => ({ ...prev, nivel: parseInt(e.target.value) || 1 }))}
                        placeholder="1-10"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{categoria.nombre}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span>Color: {categoria.color}</span>
                      <span>Nivel: {categoria.nivel}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(categoria)} className="flex-shrink-0">
                    Editar
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};