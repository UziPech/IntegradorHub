import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, Search } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';

// Components
import { CreateProjectForm } from '../../projects/components/CreateProjectForm';
import { ProjectCard } from '../../projects/components/ProjectCard';
import { ProjectDetailsModal } from '../../projects/components/ProjectDetailsModal';

export function DashboardPage() {
    const { userData } = useAuth();
    const [projects, setProjects] = useState([]);
    const [groupName, setGroupName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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

    const [suggestedStudents, setSuggestedStudents] = useState([]);

    useEffect(() => {
        if (userData?.rol === 'admin') window.location.href = '/admin';
        if (userData?.grupoId) {
            Promise.all([fetchProjects(), fetchGroupDetails(), fetchSuggestions()]);
        } else {
            setLoading(false);
        }
    }, [userData]);

    const fetchGroupDetails = async () => {
        try {
            const response = await api.get(`/api/admin/groups/${userData.grupoId}`);
            setGroupName(response.data.nombre);
        } catch (error) { console.error('Error fetching group:', error); }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get(`/api/projects/group/${userData.grupoId}`);
            setProjects(response.data);
        } catch (error) { console.error('Error fetching projects:', error); }
        finally { setLoading(false); }
    };

    const fetchSuggestions = async () => {
        if (userData?.rol !== 'Alumno') return;
        try {
            // Reusing the endpoint from TeamPage
            const response = await api.get(`/api/teams/available-students?groupId=${userData.grupoId}`);
            // Randomize or take first 4 excluding self is handled by backend usually or we filter here
            setSuggestedStudents(response.data.filter(s => s.id !== userData.userId).slice(0, 4));
        } catch (error) { console.error('Error fetching suggestions:', error); }
    };

    const filteredProjects = projects.filter(p =>
        p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.liderNombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full">
            {/* Welcome Banner Removed for Neumorphic Clean Layout */}
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Title */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Mis Proyectos Activos</h1>
                    {userData?.rol === 'Alumno' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="neu-flat px-6 py-3 rounded-xl font-bold text-gray-700 hover:text-blue-600 active:neu-pressed transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span>Nuevo Proyecto</span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 neu-flat rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                                <motion.div key={project.id} variants={itemVariants}>
                                    <ProjectCard
                                        project={project}
                                        onClick={() => setSelectedProject(project)}
                                        layoutId={project.id}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full neu-flat rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <h3 className="text-2xl font-bold text-gray-600 mb-4">No tienes proyectos activos</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-8">
                                    Comienza creando uno nuevo para colaborar con tu equipo o espera a ser asignado por un docente.
                                </p>
                                {userData?.rol === 'Alumno' && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="neu-flat px-8 py-3 rounded-xl font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <Plus size={20} />
                                        Crear Primer Proyecto
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            {/* Modals with AnimatePresence */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#F0F0F3] neu-flat w-full max-w-2xl rounded-[2rem] overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <CreateProjectForm
                                onClose={() => setShowCreateModal(false)}
                                onSuccess={() => {
                                    setShowCreateModal(false);
                                    fetchProjects();
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}

                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#F0F0F3] neu-flat w-full max-w-4xl rounded-[2rem] overflow-hidden max-h-[90vh]"
                        >
                            <ProjectDetailsModal
                                project={selectedProject}
                                onClose={() => setSelectedProject(null)}
                                onUpdate={fetchProjects}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
