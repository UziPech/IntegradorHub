import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, ExternalLink, Calendar, BookOpen, Hash, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';
import { EvaluationPanel } from '../../evaluations/components/EvaluationPanel';
import { CanvasEditor } from './CanvasEditor';

export function ProjectDetailsModal({ project: initialProject, onClose, onUpdate }) {
    const { userData } = useAuth();
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState('docs'); // 'docs' | 'eval'
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(true);
    const [error, setError] = useState('');

    const isLeader = userData?.userId === project.liderId;

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const response = await api.get(`/api/projects/${initialProject.id}`);
            const projectData = response.data;
            // Normalize canvas/canvasBlocks if needed
            if (!projectData.canvas) projectData.canvas = projectData.canvasBlocks || [];
            setProject(projectData);
        } catch (err) {
            console.error('Error fetching details:', err);
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail) return;

        setLoading(true);
        setError('');

        try {
            await api.post(`/api/projects/${project.id}/members`, {
                leaderId: userData.userId,
                emailOrMatricula: newMemberEmail
            });
            setNewMemberEmail('');
            await fetchDetails();
            onUpdate?.();
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data?.message || 'Error al agregar miembro');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('¿Estás seguro de eliminar a este miembro?')) return;

        setLoading(true);
        try {
            await api.delete(`/api/projects/${project.id}/members/${memberId}?requestingUserId=${userData.userId}`);
            await fetchDetails();
            onUpdate?.();
        } catch (err) {
            console.error('Error removing member:', err);
            setError(err.response?.data?.message || 'Error al eliminar miembro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F0F0F3] p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider neu-pressed flex items-center gap-1 ${project.estado === 'Activo' ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                            <Activity size={12} />
                            {project.estado}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider neu-pressed text-gray-500 flex items-center gap-1">
                            <BookOpen size={12} />
                            {project.materia}
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{project.titulo}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="neu-icon-btn w-12 h-12 bg-[#F0F0F3] flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                {/* Left Column: Metadata & Team (Scrollable) */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Info Card */}
                    <div className="neu-flat rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Hash size={18} className="text-blue-500" /> Detalles
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                                <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                    <Calendar size={16} /> Fecha
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {(() => {
                                        if (!project.createdAt) return 'N/A';
                                        if (typeof project.createdAt === 'object' && project.createdAt.seconds) {
                                            return new Date(project.createdAt.seconds * 1000).toLocaleDateString();
                                        }
                                        const date = new Date(project.createdAt);
                                        return isNaN(date.getTime()) ? 'Pendiente' : date.toLocaleDateString();
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                                <span className="text-sm text-gray-500 font-medium">Ciclo</span>
                                <span className="text-sm font-bold text-gray-800">{project.ciclo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Team Card */}
                    <div className="neu-flat rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Users size={18} className="text-blue-500" />
                            Squad ({project.miembrosIds?.length || 0}/5)
                        </h3>

                        {/* Add Member */}
                        {isLeader && (
                            <form onSubmit={handleAddMember} className="mb-6">
                                <div className="neu-pressed rounded-2xl p-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="Matrícula..."
                                        className="bg-transparent flex-1 px-2 outline-none text-sm font-medium text-gray-700 placeholder-gray-400"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !newMemberEmail}
                                        className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                </div>
                                {error && <p className="text-xs text-red-500 mt-2 ml-2 font-medium">{error}</p>}
                            </form>
                        )}

                        {/* Members List */}
                        <div className="space-y-3">
                            {fetchingDetails ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : (
                                (project.members || []).length > 0 ? (
                                    (project.members || []).map((member, idx) => (
                                        <motion.div
                                            key={member.id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="neu-flat p-3 rounded-2xl flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center border-2 border-[#F0F0F3] overflow-hidden bg-white text-gray-700">
                                                    <span className="text-sm font-bold">{(member.nombre || 'U').charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{member.nombre || 'Usuario'}</p>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">{member.rol || 'Miembro'}</p>
                                                </div>
                                            </div>

                                            {member.id === project.liderId ? (
                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Líder</span>
                                            ) : (
                                                (isLeader || userData?.userId === member.id) && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No hay miembros aún.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">

                    {/* Tabs & Action */}
                    <div className="flex justify-between items-center bg-[#F0F0F3] z-10">
                        {/* Tabs */}
                        <div className="bg-gray-200/50 p-1 rounded-2xl inline-flex">
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'docs'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Documentación
                            </button>
                            <button
                                onClick={() => setActiveTab('eval')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'eval'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Evaluación
                            </button>
                        </div>

                        {/* Edit Button (only visible in docs tab for members/leader) */}
                        <div className="flex gap-2">
                            {(isLeader || (project.members || []).some(m => m.id === userData.userId)) && (
                                <button
                                    onClick={() => window.open(`/project/${project.id}/editor`, '_self')}
                                    className="neu-flat px-4 py-2 rounded-xl font-bold text-sm text-gray-700 hover:text-blue-600 active:neu-pressed transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="neu-flat rounded-3xl p-6 flex-1 overflow-auto custom-scrollbar relative bg-white">
                        {activeTab === 'docs' ? (
                            <div className="h-full overflow-y-auto w-full">
                                {fetchingDetails ? (
                                    <div className="space-y-4">
                                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                                    </div>
                                ) : (
                                    <CanvasEditor
                                        project={project}
                                        readOnly={true}
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
                                    <Activity size={24} className="text-blue-500" />
                                    Evaluación y Rúbrica
                                </h3>
                                <EvaluationPanel projectId={project.id} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
