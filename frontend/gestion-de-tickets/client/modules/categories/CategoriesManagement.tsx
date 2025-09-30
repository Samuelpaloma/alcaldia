import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import './CategoriesManagement.css';
import { api, CategoriaResponseDTO, PageResponse } from '../../../shared/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Palette, 
  Hash, 
  Tag,
  BarChart3,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface CategoriesManagementProps {
  userRole: string;
}

interface CategoriaFormData {
  nombre: string;
  descripcion: string;
  colorHex: string;
  icono: string;
  orden: number;
  activa: boolean;
}

export const CategoriesManagement: React.FC<CategoriesManagementProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoriaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoriaResponseDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Estados del formulario
  const [formData, setFormData] = useState<CategoriaFormData>({
    nombre: '',
    descripcion: '',
    colorHex: '#3B82F6',
    icono: 'tag',
    orden: 1,
    activa: true
  });

  // Colores predefinidos
  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#1E293B'
  ];

  // Iconos predefinidos
  const predefinedIcons = [
    'tag', 'user', 'alert-triangle', 'file-text', 'help-circle',
    'briefcase', 'calculator', 'users', 'folder', 'monitor',
    'database', 'wifi', 'code', 'wrench', 'tool', 'shield',
    'cpu', 'layers', 'globe', 'headphones'
  ];

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [page, filterActive]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response: PageResponse<CategoriaResponseDTO> = await api.getTodasLasCategorias(page, 20);
      setCategories(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getCategoriaStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.createCategoria(formData);
      setShowCreateDialog(false);
      resetForm();
      loadCategories();
      loadStats();
      toast({
        title: "Categoría creada",
        description: "La categoría se creó correctamente",
      });
    } catch (error) {
      console.error('Error creando categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      setSaving(true);
      await api.updateCategoria(editingCategory.idCategoria, formData);
      setEditingCategory(null);
      resetForm();
      loadCategories();
      loadStats();
      toast({
        title: "Categoría actualizada",
        description: "La categoría se actualizó correctamente",
      });
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      await api.deleteCategoria(id);
      loadCategories();
      loadStats();
      toast({
        title: "Categoría eliminada",
        description: "La categoría se eliminó correctamente",
      });
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: CategoriaResponseDTO) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
      colorHex: getCategoryColor(category.idCategoria),
      icono: 'tag',
      orden: category.orden,
      activa: category.activa
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      colorHex: '#3B82F6',
      icono: 'tag',
      orden: 1,
      activa: true
    });
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && category.activa) ||
                         (filterActive === 'inactive' && !category.activa);
    
    return matchesSearch && matchesFilter;
  });

  const getIconComponent = (iconName: string) => {
    // Mapeo simple de iconos - en una implementación real usarías una librería de iconos
    const iconMap: { [key: string]: string } = {
      'tag': '🏷️',
      'user': '👤',
      'alert-triangle': '⚠️',
      'file-text': '📄',
      'help-circle': '❓',
      'briefcase': '💼',
      'calculator': '🧮',
      'users': '👥',
      'folder': '📁',
      'monitor': '🖥️',
      'database': '🗄️',
      'wifi': '📶',
      'code': '💻',
      'wrench': '🔧',
      'tool': '🛠️',
      'shield': '🛡️',
      'cpu': '🖥️',
      'layers': '📚',
      'globe': '🌐',
      'headphones': '🎧'
    };
    return iconMap[iconName] || '🏷️';
  };

  const getCategoryIcon = (idCategoria: number) => {
    const iconMap: { [key: number]: string } = {
      1: '👤', // Atención al Ciudadano
      2: '⚠️', // Quejas y Reclamos
      3: '📄', // Solicitudes
      4: '❓', // General
      5: '💼', // Administración y Gestión
      6: '🧮', // Contabilidad
      7: '👥', // Recursos Humanos
      8: '📁', // Gestión Documental
      9: '🖥️', // Tecnología e IT
      10: '🗄️', // Sistemas de Información
      11: '📶', // Redes y Comunicaciones
      12: '💻', // Desarrollo de Software
      13: '🔧', // Infraestructura y Mantenimiento
      14: '🛠️', // Mantenimiento
      15: '🛡️', // Servicios Generales
      16: '🖥️', // Hardware
      17: '📚', // Software
      18: '🌐', // Redes
      19: '🎧' // Soporte Técnico
    };
    return iconMap[idCategoria] || '🏷️';
  };

  const getCategoryColor = (idCategoria: number) => {
    const colorMap: { [key: number]: string } = {
      1: '#FF5733', // Atención al Ciudadano
      2: '#F59E0B', // Quejas y Reclamos
      3: '#3498DB', // Solicitudes
      4: '#95A5A6', // General
      5: '#9B59B6', // Administración y Gestión
      6: '#8E44AD', // Contabilidad
      7: '#8E44AD', // Recursos Humanos
      8: '#8E44AD', // Gestión Documental
      9: '#2ECC71', // Tecnología e IT
      10: '#27AE60', // Sistemas de Información
      11: '#27AE60', // Redes y Comunicaciones
      12: '#27AE60', // Desarrollo de Software
      13: '#F39C12', // Infraestructura y Mantenimiento
      14: '#E67E22', // Mantenimiento
      15: '#E67E22', // Servicios Generales
      16: '#34495E', // Hardware
      17: '#2C3E50', // Software
      18: '#1ABC9C', // Redes
      19: '#16A085' // Soporte Técnico
    };
    return colorMap[idCategoria] || '#95A5A6';
  };

  return (
    <div className="categories-module">
      <div className="module-header" style={{ marginTop: '-1rem' }}>
        <div className="header-content">
          <h1 className="page-title">Gestión de Categorías</h1>
          <p className="page-subtitle">Administra las categorías de tickets del sistema</p>
        </div>
        <div className="header-actions" style={{ marginTop: '0.5rem' }}>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
              saving={saving}
              predefinedColors={predefinedColors}
              predefinedIcons={predefinedIcons}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-8">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{stats.totalCategorias || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Activas</p>
                  <p className="text-lg font-bold">{stats.categoriasActivas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Inactivas</p>
                  <p className="text-lg font-bold">{stats.categoriasInactivas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Con Tickets</p>
                  <p className="text-lg font-bold">{stats.categoriasConTickets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mt-8">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterActive('all')}
                size="sm"
                className="h-9 px-3 text-xs"
              >
                Todas
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterActive('active')}
                size="sm"
                className="h-9 px-3 text-xs"
              >
                Activas
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterActive('inactive')}
                size="sm"
                className="h-9 px-3 text-xs"
              >
                Inactivas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12 mt-8">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron categorías</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.idCategoria} className="hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-base flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(category.idCategoria) }}
                    >
                      {getCategoryIcon(category.idCategoria)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm truncate">{category.nombre}</h3>
                        <Badge variant={category.activa ? "default" : "secondary"} className="text-xs px-2 py-0.5 h-5">
                          {category.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{category.idCategoria}</span>
                        <span>•</span>
                        <span>Orden: {category.orden}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.idCategoria)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Dialog de Edición */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdate}
            onCancel={() => setEditingCategory(null)}
            saving={saving}
            predefinedColors={predefinedColors}
            predefinedIcons={predefinedIcons}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente del formulario de categoría
interface CategoryFormProps {
  formData: CategoriaFormData;
  setFormData: (data: CategoriaFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  predefinedColors: string[];
  predefinedIcons: string[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  saving,
  predefinedColors,
  predefinedIcons
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre de la categoría"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orden">Orden</Label>
          <Input
            id="orden"
            type="number"
            value={formData.orden}
            onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
            placeholder="Orden de visualización"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Descripción de la categoría"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.colorHex === color ? 'border-foreground' : 'border-muted'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, colorHex: color })}
            />
          ))}
        </div>
        <Input
          value={formData.colorHex}
          onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
          placeholder="#3B82F6"
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <Label>Icono</Label>
        <div className="grid grid-cols-10 gap-2">
          {predefinedIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`p-2 rounded border ${
                formData.icono === icon ? 'border-primary bg-primary/10' : 'border-muted'
              }`}
              onClick={() => setFormData({ ...formData, icono: icon })}
            >
              <span className="text-lg">{icon === 'tag' ? '🏷️' : icon === 'user' ? '👤' : '🏷️'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activa"
          checked={formData.activa}
          onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="activa">Categoría activa</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={saving || !formData.nombre.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
};