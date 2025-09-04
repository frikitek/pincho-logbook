import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, Plus } from 'lucide-react';
import { Pincho, deletePincho, canUserRate, getCategorias } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { ValoracionDialog } from './ValoracionDialog';
import { PinchoForm } from './PinchoForm';

interface PinchoListProps {
  pinchos: Pincho[];
  onUpdate: () => void;
}

export const PinchoList = ({ pinchos, onUpdate }: PinchoListProps) => {
  const [selectedPincho, setSelectedPincho] = useState<Pincho | null>(null);
  const [editingPincho, setEditingPincho] = useState<Pincho | null>(null);
  const [valoracionDialogOpen, setValoracionDialogOpen] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const cats = await getCategorias();
      setCategorias(cats);
    })();
  }, []);

  const getCategoriaInfo = (categoriaId: number) => {
    const categoria = categorias.find((c: any) => c.id === categoriaId);
    if (!categoria) {
      return { nombre: `Cat. ${categoriaId}`, color: '#6b7280' };
    }
    return { nombre: categoria.nombre, color: categoria.color };
  };

  const getPromedio = (valoraciones: any[]) => {
    if (valoraciones.length === 0) return 0;
    return valoraciones.reduce((sum, v) => sum + v.nota, 0) / valoraciones.length;
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${nombre}"?`)) {
      const success = deletePincho(id);
      if (success) {
        toast({
          title: "Pincho eliminado",
          description: `"${nombre}" ha sido eliminado correctamente.`
        });
        onUpdate();
      }
    }
  };

  const handleAddValoracion = (pincho: Pincho) => {
    setSelectedPincho(pincho);
    setValoracionDialogOpen(true);
  };

  if (editingPincho) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setEditingPincho(null)}
            className="mr-4"
          >
            ← Volver
          </Button>
          <h2 className="text-2xl font-bold">Editar Pincho</h2>
        </div>
        <PinchoForm 
          pincho={editingPincho}
          onSuccess={() => {
            setEditingPincho(null);
            onUpdate();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pinchos ({pinchos.length})</h2>
      </div>

      {pinchos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay pinchos registrados todavía.</p>
            <p className="text-sm text-muted-foreground">Usa el botón "Nuevo" para crear tu primer pincho.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pinchos.map((pincho) => (
            <Card key={pincho.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{pincho.nombre}</CardTitle>
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: getCategoriaInfo(pincho.categoria).color,
                      color: 'white'
                    }}
                  >
                    {getCategoriaInfo(pincho.categoria).nombre}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{pincho.bar}</p>
                  <p className="font-semibold text-primary">{pincho.precio.toFixed(2)}€</p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {pincho.foto && (
                  <img 
                    src={pincho.foto} 
                    alt={pincho.nombre}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {getPromedio(pincho.valoraciones).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({pincho.valoraciones.length})
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddValoracion(pincho)}
                    disabled={!canUserRate(pincho.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {canUserRate(pincho.id) ? 'Valorar' : 'Ya valorado'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingPincho(pincho)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(pincho.id, pincho.nombre)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {pincho.valoraciones.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Últimas valoraciones:</h4>
                    {pincho.valoraciones.slice(-2).reverse().map((valoracion) => (
                      <div key={valoracion.id} className="text-xs p-2 bg-muted rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{valoracion.nota}/5 ⭐</span>
                          <span className="text-muted-foreground">
                            {new Date(valoracion.fecha).toLocaleDateString()}
                          </span>
                        </div>
                        {valoracion.comentario && (
                          <p className="mt-1 text-muted-foreground line-clamp-2">
                            {valoracion.comentario}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ValoracionDialog
        pincho={selectedPincho}
        open={valoracionDialogOpen}
        onOpenChange={setValoracionDialogOpen}
        onSuccess={onUpdate}
      />
    </div>
  );
};