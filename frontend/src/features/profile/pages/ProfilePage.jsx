import { useAuth } from '../../auth/hooks/useAuth';
import { Mail, Phone, MapPin, Calendar, Camera, Edit2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfilePage() {
    const { userData } = useAuth();

    if (!userData) return null;

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Main Neumorphic Card */}
            <div className="neu-flat rounded-[3rem] overflow-hidden relative">

                {/* Cover with Gradient Overlay */}
                <div className="h-72 w-full bg-gradient-to-r from-gray-200 to-gray-300 relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <button className="absolute top-6 right-6 neu-icon-btn w-12 h-12 bg-[#e0e5ec]">
                        <Camera size={20} />
                    </button>
                </div>

                {/* Profile Header Content */}
                <div className="px-8 sm:px-12 lg:px-16 pb-12 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-20">

                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full neu-flat p-2 bg-[#e0e5ec]">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    {userData.fotoUrl ? (
                                        <img src={userData.fotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                                            {userData.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 neu-icon-btn w-10 h-10 bg-[#e0e5ec] text-blue-600">
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 mt-4 md:mt-20">
                            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                                {userData.nombre} {userData.apellido}
                            </h1>
                            <p className="text-lg text-gray-500 font-medium mt-1">
                                {userData.rol}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Online
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="mt-4 md:mt-20">
                            <button className="px-6 py-3 neu-flat rounded-xl font-semibold text-gray-600 hover:text-blue-600 transition-all active:neu-pressed flex items-center gap-2">
                                <Edit2 size={18} />
                                <span>Editar Perfil</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="col-span-2 neu-flat rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        Información de Contacto
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="neu-pressed rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center text-blue-500">
                                <Mail size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                                <p className="text-gray-700 font-medium truncate" title={userData.email}>{userData.email}</p>
                            </div>
                        </div>

                        <div className="neu-pressed rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center text-green-500">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Teléfono</p>
                                <p className="text-gray-700 font-medium">{userData.telefono || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="neu-pressed rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center text-red-500">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ubicación</p>
                                <p className="text-gray-700 font-medium">{userData.direccion || 'No especificada'}</p>
                            </div>
                        </div>

                        <div className="neu-pressed rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center text-purple-500">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Miembro Desde</p>
                                <p className="text-gray-700 font-medium">Enero 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Card / Stats */}
                <div className="neu-flat rounded-3xl p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-24 h-24 rounded-full neu-pressed flex items-center justify-center mb-6 relative">
                        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#F0F0F3"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeDasharray="85, 100"
                            />
                        </svg>
                        <span className="absolute text-2xl font-bold text-blue-600">85%</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Perfil Completado</h3>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        Completa tu información para obtener mejor visibilidad en la plataforma.
                    </p>
                    <button className="mt-6 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all">
                        Completar
                    </button>
                </div>
            </div>
        </div>
    );
}
