import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, Users, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export function Sidebar() {
    const { userData, logout } = useAuth();

    const menuItems = [
        { icon: Home, label: 'Inicio', path: '/dashboard' },
        { icon: FolderOpen, label: 'Mis Proyectos', path: '/projects' },
        { icon: Users, label: 'Mi Equipo', path: '/team' },
        { icon: Calendar, label: 'Agenda', path: '/calendar' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-50 flex flex-col z-50 shadow-lg border-r border-gray-200">
            {/* Logo Brand */}
            <div className="p-6 pb-4">
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">IntegradorHub</h1>
                <p className="text-xs text-gray-500 mt-1 font-medium">Gestión de Proyectos</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
                {/* Principal Section */}
                <div className="mb-6">
                    <h2 className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Principal
                    </h2>
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className="flex-shrink-0"
                                        />
                                        <span className="text-sm">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    <h2 className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Cuenta
                    </h2>
                    <div className="space-y-2">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                ${isActive
                                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                }
                            `}
                        >
                            <User size={20} strokeWidth={2} className="flex-shrink-0" />
                            <span className="text-sm">Mi Perfil</span>
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Footer with User Info and Logout */}
            <div className="border-t border-gray-200 p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {userData?.fotoUrl ? (
                            <img
                                src={userData.fotoUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <span className="text-sm">
                                {userData?.nombre?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {userData?.nombre?.split(' ')[0] || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {userData?.rol || 'Estudiante'}
                        </p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                >
                    <LogOut size={20} strokeWidth={2} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
