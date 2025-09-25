import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { detectRoleByToken, getAuth } from '../auth/auth';
import DashboardModule from './DashboardModule';
import TicketsModule from './TicketsModule';
import UsersModule from './UsersModule';
import EvidencesModule from './EvidencesModule';
import './AdminDashboard.css';

interface AdminDashboardProps {
  userRole: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'usuarios' | 'evidencias'>('dashboard');

  // Detectar pestaña activa basada en la URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') {
      setActiveTab('dashboard');
    } else if (path === '/tickets') {
      setActiveTab('tickets');
    } else if (path === '/users-roles') {
      setActiveTab('usuarios');
    } else if (path === '/evidences') {
      setActiveTab('evidencias');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Función para cambiar de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    switch (tab) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'tickets':
        navigate('/tickets');
        break;
      case 'usuarios':
        navigate('/users-roles');
        break;
      case 'evidencias':
        navigate('/evidences');
        break;
      default:
        navigate('/admin');
    }
  };

  // Debug: Mostrar información del rol
  useEffect(() => {
    const auth = getAuth();
    const detectedRole = detectRoleByToken();
    console.log('🔍 Debug AdminDashboard:');
    console.log('  - userRole prop:', userRole);
    console.log('  - detectedRole:', detectedRole);
    console.log('  - auth:', auth);
    console.log('  - token:', auth?.token);
  }, [userRole]);

  const detectedRole = detectRoleByToken();
  const hasAccess = userRole === 'admin' || userRole === 'superadmin' || 
                   detectedRole === 'admin' || detectedRole === 'superadmin';
  
  if (!hasAccess) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <div className="access-denied-content">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder al dashboard de administradores.
            </p>
            <div className="debug-info text-sm text-gray-500 mb-6">
              <p>Rol recibido: {userRole}</p>
              <p>Rol detectado: {detectedRole}</p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="tab-content">
        {activeTab === 'dashboard' && <DashboardModule userRole={userRole} />}
        {activeTab === 'tickets' && <TicketsModule userRole={userRole} />}
        {activeTab === 'usuarios' && <UsersModule userRole={userRole} />}
        {activeTab === 'evidencias' && <EvidencesModule userRole={userRole} />}
      </div>
    </div>
  );
};

export default AdminDashboard;