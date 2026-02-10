import { motion } from 'framer-motion';
import { LayoutGrid, Users, User, Clock } from 'lucide-react';

export function ProjectCard({ project, onClick, layoutId }) {
    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="neu-flat rounded-3xl p-6 cursor-pointer relative overflow-hidden group transition-all duration-300"
        >
            {/* Status Badge - Neumorphic Inset */}
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full neu-pressed flex items-center justify-center text-blue-500">
                    <LayoutGrid size={20} />
                </div>
                {project.estado && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.estado === 'Activo' ? 'text-blue-600 bg-blue-100/50' :
                            project.estado === 'Completado' ? 'text-green-600 bg-green-100/50' : 'text-gray-500 bg-gray-200'
                        }`}>
                        {project.estado}
                    </span>
                )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {project.titulo}
            </h3>

            {/* Docente / Subject Info */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 font-medium">
                <User size={14} />
                <span>{project.docenteNombre || 'Sin Docente'}</span>
            </div>

            {/* Footer: Members & Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                {/* Avatars */}
                <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full neu-pressed flex items-center justify-center border-2 border-[#F0F0F3] text-xs font-bold text-gray-600" title={`Líder: ${project.liderNombre}`}>
                        {project.liderNombre?.charAt(0)}
                    </div>
                    {[...Array(Math.min(project.miembrosIds?.length || 0, 2))].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-[#F0F0F3] flex items-center justify-center">
                            <Users size={12} className="text-gray-500" />
                        </div>
                    ))}
                </div>

                {/* Date/Info */}
                {project.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Clock size={12} />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
