import { NavLink } from 'react-router-dom';
import { FolderOpen, Users, Calendar, LogOut, LayoutDashboard, Rocket, Trophy, X } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserAvatar } from '../../../components/UserAvatar';

export function Sidebar({ isOpen, onClose }) {
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
        // Items exclusivos para Estudiantes (y Admins para debug)
        ...(['Alumno', 'Admin', 'admin', 'SuperAdmin'].includes(userData?.rol) ? [
          { label: 'Mis Proyectos', path: '/projects', icon: FolderOpen },
          { label: 'Mi Equipo', path: '/team', icon: Users },
        ] : []),

        // Items exclusivos para Docentes
        ...(userData?.rol === 'Docente' ? [
          { label: 'Evaluaciones', path: '/evaluations', icon: FolderOpen },
        ] : []),

        { label: 'Agenda', path: '/calendar', icon: Calendar },
      ]
    },
    ...(userData?.rol === 'admin' || userData?.rol === 'SuperAdmin' ? [{
      title: 'ADMINISTRACIÓN',
      items: [
        { label: 'Panel Admin', path: '/admin', icon: Users }
      ]
    }] : [])
  ];

  return (
    <>
      {/* Mobile Overlay Background */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 font-sans h-full shrink-0
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          /* Mobile classes */
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'} 
          /* Desktop classes: Collapsed by default (w-20), Expanded on hover (w-72) */
          lg:translate-x-0 lg:w-20 lg:hover:w-72 group
        `}
      >
        {/* Header / Logo Brand */}
        <div className="flex items-center justify-between p-6 lg:p-4 lg:group-hover:p-6 transition-all duration-300 border-b border-gray-100 overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <img
              src="/byfrost-icon.png"
              alt="Byfrost Logo"
              className="w-12 h-12 shrink-0 rounded-2xl object-cover shadow-sm border border-gray-200"
            />
            {/* Text logo (hidden when collapsed on desktop, visible on hover/mobile) */}
            <div className="transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Byfrost®
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Repositorio de Proyectos</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {/* Group Title - hidden on desktop collapsed, visible on hover/mobile */}
              <h3 className="px-5 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 h-4 overflow-hidden">
                <span className="lg:hidden lg:group-hover:inline-block whitespace-nowrap">{group.title}</span>
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        // Close sidebar on mobile when a link is clicked
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) => `
                        flex items-center relative px-3 py-2.5 rounded-xl transition-all duration-200 group/navitem
                        ${isActive
                          ? 'bg-gray-100 text-gray-900 font-semibold'
                          : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                      // Tooltip for collapsed state
                      title={item.label}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-lg transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover/navitem:text-gray-700'}`}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                          </div>

                          {/* Label Text */}
                          <span className={`
                            ml-3 whitespace-nowrap transition-all duration-300
                            lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0
                            ${isActive ? 'text-gray-900' : 'text-gray-600'}
                          `}>
                            {item.label}
                          </span>
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
        <div className="p-3 shrink-0 border-t border-gray-100 py-4">
          <NavLink
            to="/profile"
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            className="bg-slate-900 rounded-2xl border border-slate-800 flex items-center p-2 transition-all hover:bg-black group/profile overflow-hidden"
            title="Ir a Perfil"
          >
            <div className="shrink-0 relative">
              <UserAvatar src={userData?.fotoUrl} name={userData?.nombre} size="sm" className="border border-slate-700 shadow-md group-hover/profile:scale-105 transition-transform" />
              {/* Status indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>

            <div className="ml-3 min-w-0 flex-1 transition-all duration-300 lg:opacity-0 lg:-translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 whitespace-nowrap">
              <p className="text-sm font-bold text-white truncate tracking-tight">
                {(userData?.nombre && userData?.nombre !== 'Usuario')
                  ? userData.nombre.replace(/^\d+\s+/, '').split(' ')[0]
                  : (userData?.email ? userData.email.split('@')[0] : 'Usuario')}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest mt-0.5">
                {userData?.rol || 'Alumno'}
              </p>
            </div>
          </NavLink>

          <div className="mt-2">
            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="w-full flex items-center p-3 text-xs font-bold text-slate-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group/logout"
            >
              <div className="shrink-0 flex items-center justify-center w-6">
                <LogOut size={16} className="group-hover/logout:-translate-x-0.5 transition-transform" />
              </div>
              <span className="ml-3 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap">
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
