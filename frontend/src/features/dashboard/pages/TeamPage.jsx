import { useState, useEffect } from 'react';
import { Search, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';

export function TeamPage() {
    const { userData } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (userData?.grupoId) {
            fetchStudents();
        }
    }, [userData]);

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/api/teams/available-students?groupId=${userData.grupoId}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.matricula.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Equipo</h1>
                <p className="text-gray-600">Conecta con tus compañeros de clase.</p>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o matrícula..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-gray-200 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-shimmer" />
                        ))}
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
                    >
                        {filteredStudents.map((student) => (
                            <motion.div
                                key={student.id}
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 flex flex-col items-center text-center transition-all group"
                            >
                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-4 border-white shadow-md group-hover:shadow-lg transition-shadow">
                                        {student.fotoUrl ? (
                                            <img 
                                                src={student.fotoUrl} 
                                                alt={student.nombreCompleto} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-50">
                                                {student.nombreCompleto.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {/* Status Indicator */}
                                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                                        student.hasProject ? 'bg-green-500' : 'bg-yellow-500'
                                    }`} />
                                </div>

                                {/* Info */}
                                <h3 className="font-semibold text-gray-900 text-base mb-1">
                                    {student.nombreCompleto}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                    <User size={14} className="text-gray-400" />
                                    {student.matricula}
                                </p>
                                
                                {/* Status Badge */}
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                    student.hasProject 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                    {student.hasProject ? 'En Proyecto' : 'Disponible'}
                                </span>

                                {/* Action Button */}
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Mail size={16} />
                                    Contactar
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} />
                        </div>
                        <p className="text-gray-900 font-medium">No se encontraron compañeros</p>
                        <p className="text-gray-500 text-sm mt-1">Intenta con otro término de búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
}
