import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pincho, createPincho, updatePincho, getCategorias } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface PinchoFormProps {
  pincho?: Pincho;
  onSuccess: () => void;
}

export const PinchoForm = ({ pincho, onSuccess }: PinchoFormProps) => {
  const [formData, setFormData] = useState({
    nombre: pincho?.nombre || '',
    bar: pincho?.bar || '',
    precio: pincho?.precio || '',
    categoria: pincho?.categoria || 1,
    foto: pincho?.foto || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const cats = await getCategorias();
      setCategorias(cats);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let foto = formData.foto;
      
      // Convert image file to base64 if present
      if (imageFile) {
        foto = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
      
      const pinchoData = {
        ...formData,
        precio: parseFloat(formData.precio.toString()) || 0,
        foto
      };

      if (pincho) {
        // Update existing pincho
        const updated = await updatePincho(pincho.id, pinchoData);
        if (updated) {
          toast({
            title: "Pincho actualizado",
            description: `"${formData.nombre}" ha sido actualizado correctamente.`
          });
        }
      } else {
        // Create new pincho
        await createPincho(pinchoData);
        toast({
          title: "Pincho creado",
          description: `"${formData.nombre}" ha sido creado correctamente.`
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el pincho.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {pincho ? 'Editar Pincho' : 'Nuevo Pincho'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre del pincho *
              </label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                className="h-12"
                placeholder="Ej: Tortilla de patatas"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bar" className="text-sm font-medium">
                Bar/Restaurante *
              </label>
              <Input
                id="bar"
                value={formData.bar}
                onChange={(e) => handleInputChange('bar', e.target.value)}
                required
                className="h-12"
                placeholder="Ej: Bar Pepe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="precio" className="text-sm font-medium">
                Precio (€) *
              </label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                required
                className="h-12"
                placeholder="2.50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="categoria" className="text-sm font-medium">
                Categoría *
              </label>
              <Select 
                value={formData.categoria.toString()} 
                onValueChange={(value) => handleInputChange('categoria', parseInt(value))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoria.color }}
                        />
                        <span>{categoria.nombre}</span>
                        <span className="text-xs text-muted-foreground">(Nivel {categoria.nivel})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="foto" className="text-sm font-medium">
              Foto del pincho (opcional)
            </label>
            <Input
              id="foto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  handleInputChange('foto', ''); // Clear URL if file selected
                }
              }}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Puedes tomar una foto con la cámara o seleccionar una imagen del dispositivo
            </p>
          </div>

          {(formData.foto || imageFile) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Vista previa:</label>
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : formData.foto} 
                alt="Vista previa"
                className="w-full max-w-xs h-32 object-cover rounded-md border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nombre.trim() || !formData.bar.trim() || !formData.precio}
            >
              {loading ? 'Guardando...' : (pincho ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};