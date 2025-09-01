import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Pincho {
  id: string;
  nombre: string;
  bar: string;
  precio: number;
  categoria: number;
  foto?: string;
  valoraciones: any[];
}

interface ValoracionDialogProps {
  pincho: Pincho | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ValoracionDialog = ({ pincho, open, onOpenChange, onSuccess }: ValoracionDialogProps) => {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincho) return;
    
    setLoading(true);
    try {
      await apiService.addValoracion({
        pincho_id: pincho.id,
        nota,
        comentario: comentario.trim() || undefined
      });
      
      toast({
        title: "Valoración añadida",
        description: `Has valorado "${pincho.nombre}" con ${nota} estrellas.`
      });
      
      setNota(0);
      setComentario('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir la valoración.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pincho) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Valorar "{pincho.nombre}"</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {pincho.bar} • {pincho.precio.toFixed(2)}€
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Puntuación *</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNota(value)}
                    className="p-1 transition-colors rounded hover:bg-muted"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= nota 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-lg font-semibold">{nota > 0 ? `${nota} de 5 estrellas` : 'Sin valorar'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comentario" className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Qué te ha parecido este pincho?"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || nota === 0}
            >
              {loading ? 'Guardando...' : 'Valorar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};