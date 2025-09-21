import React, { useState, useEffect } from 'react';
import { api, CategoriaResponseDTO, CategoriaRequestDTO, PageResponse } from '../../../shared/api';
import './CategoriesManagement.css';

interface CategoriesManagementProps {
  userRole: string;
}

const CategoriesManagement: React.FC<CategoriesManagementProps> = ({ userRole }) => {
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaResponseDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Estados para el formulario
  const [formData, setFormData] = useState<CategoriaRequestDTO>({
    nombre: '',
    descripcion: '',
    orden: 0
  });

  // Cargar categorías
  const loadCategorias = async (page: number = 0, search?: string, activa?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PageResponse<CategoriaResponseDTO> = await api.getTodasLasCategorias(
        page, 
        pageSize, 
        activa, 
        search
      );
      
      setCategorias(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias(0, searchTerm, filterActive);
  }, [searchTerm, filterActive]);

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  // Manejar filtro de estado
  const handleFilterChange = (value: boolean | undefined) => {
    setFilterActive(value);
    setCurrentPage(0);
  };

  // Abrir modal para crear/editar
  const openModal = (categoria?: CategoriaResponseDTO) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        orden: categoria.orden
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        descripcion: '',
        orden: 0
      });
    }
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      orden: 0
    });
  };

  // Guardar categoría
  const handleSave = async () => {
    try {
      if (!formData.nombre.trim()) {
        setError('El nombre de la categoría es obligatorio');
        return;
      }

      if (editingCategoria) {
        await api.actualizarCategoria(editingCategoria.idCategoria, formData);
      } else {
        await api.crearCategoria(formData);
      }

      closeModal();
      loadCategorias(currentPage, searchTerm, filterActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar categoría');
      console.error('Error guardando categoría:', err);
    }
  };

  // Toggle estado de categoría
  const handleToggleStatus = async (categoria: CategoriaResponseDTO) => {
    try {
      await api.toggleEstadoCategoria(categoria.idCategoria);
      loadCategorias(currentPage, searchTerm, filterActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error cambiando estado:', err);
    }
  };

  // Eliminar categoría
  const handleDelete = async (categoria: CategoriaResponseDTO) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      await api.eliminarCategoria(categoria.idCategoria);
      loadCategorias(currentPage, searchTerm, filterActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
      console.error('Error eliminando categoría:', err);
    }
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadCategorias(newPage, searchTerm, filterActive);
  };

  // Verificar permisos
  const canManage = userRole === 'ADMINISTRADOR' || userRole === 'SUPERADMIN';

  if (!canManage) {
    return (
      <div className="categories-management">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para gestionar categorías.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-management">
      <div className="categories-header">
        <h2>Gestión de Categorías</h2>
        <button 
          className="btn btn-primary"
          onClick={() => openModal()}
        >
          <i className="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="categories-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterActive === undefined ? 'active' : ''}`}
            onClick={() => handleFilterChange(undefined)}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filterActive === true ? 'active' : ''}`}
            onClick={() => handleFilterChange(true)}
          >
            Activas
          </button>
          <button
            className={`filter-btn ${filterActive === false ? 'active' : ''}`}
            onClick={() => handleFilterChange(false)}
          >
            Inactivas
          </button>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="categories-table-container">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Cargando categorías...
          </div>
        ) : categorias.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h3>No hay categorías</h3>
            <p>No se encontraron categorías con los filtros aplicados.</p>
          </div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.idCategoria}>
                  <td>
                    <div className="categoria-name">
                      <strong>{categoria.nombre}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="categoria-description">
                      {categoria.descripcion || '-'}
                    </div>
                  </td>
                  <td>
                    <span className="categoria-order">{categoria.orden}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${categoria.activa ? 'active' : 'inactive'}`}>
                      {categoria.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="categoria-date">
                      {new Date(categoria.fechaCreacion).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openModal(categoria)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`btn btn-sm ${categoria.activa ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(categoria)}
                        title={categoria.activa ? 'Desactivar' : 'Activar'}
                      >
                        <i className={`fas ${categoria.activa ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(categoria)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <i className="fas fa-chevron-left"></i> Anterior
          </button>
          
          <span className="pagination-info">
            Página {currentPage + 1} de {totalPages} ({totalElements} categorías)
          </span>
          
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Siguiente <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="orden">Orden</label>
                <input
                  id="orden"
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  placeholder="Orden de visualización"
                  min="0"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingCategoria ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
