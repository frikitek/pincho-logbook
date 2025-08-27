import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Categoria, getCategorias, updateCategoria } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

export const CategoriasManager = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ nombre: '', color: '' });
  const { toast } = useToast();

  useEffect(() => {
    setCategorias(getCategorias());
  }, []);

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setEditData({ nombre: categoria.nombre, color: categoria.color });
  };

  const handleSave = () => {
    if (!editingId) return;
    
    const updated = updateCategoria(editingId, editData);
    if (updated) {
      setCategorias(getCategorias());
      setEditingId(null);
      toast({
        title: "Categoría actualizada",
        description: `"${editData.nombre}" ha sido actualizada correctamente.`
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ nombre: '', color: '' });
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
            <div key={categoria.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: categoria.color }}
              />
              
              {editingId === categoria.id ? (
                <>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={editData.nombre}
                      onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre de la categoría"
                    />
                    <Input
                      type="color"
                      value={editData.color}
                      onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h3 className="font-medium">{categoria.nombre}</h3>
                    <p className="text-sm text-muted-foreground">Color: {categoria.color}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(categoria)}>
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