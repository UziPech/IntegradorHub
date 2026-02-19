import { NavLink } from 'react-router-dom';
import { FolderOpen, Users, Calendar, LogOut, LayoutDashboard, Rocket, Trophy } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export function Sidebar() {
  const { userData, logout } = useAuth();

  const menuGroups = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Galería', path: '/showcase', icon: Rocket },
        { label: 'Ranking', path: '/ranking', icon: Trophy },
      ]
    },
    {
      title: 'GESTIÓN',
      items: [
        { label: 'Mis Proyectos', path: '/projects', icon: FolderOpen },
        { label: 'Mi Equipo', path: '/team', icon: Users },
        { label: 'Agenda', path: '/calendar', icon: Calendar },
      ]
    },
    ...(userData?.rol === 'admin' || userData?.rol === 'SuperAdmin' ? [{
      title: 'ADMINISTRACIÓN',
      items: [
        { label: 'Panel Admin', path: '/admin', icon: Users } // Using Users as generic admin icon or LayoutDashboard
      ]
    }] : [])
  ];

  return (
    <aside className="w-72 h-full bg-white border-r border-gray-200 flex flex-col z-50 shrink-0 font-sans">
      {/* Logo Brand */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          IntegradorHub
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1.5">Gestión de Proyectos</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer with User Info */}
      <div className="p-4 m-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm">
            {userData?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userData?.nombre?.split(' ')[0] || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 font-medium truncate uppercase">
              {userData?.rol || 'Estudiante'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 py-2 rounded-lg transition-all duration-200"
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
