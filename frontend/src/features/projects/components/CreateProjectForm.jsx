import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, ArrowRight, User, Layout } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export function CreateProjectForm({ onClose, onSuccess }) {
    const { userData } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data Sources
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [isLoadingResources, setIsLoadingResources] = useState(true);

    // Form State
    const [form, setForm] = useState({
        titulo: '',
        materia: '',
        materiaId: '',
        docenteId: '',
        ciclo: '2026-1',
        stackTecnologico: '',
        miembrosIds: []
    });

    const [studentSearch, setStudentSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');


    useEffect(() => {
        if (userData?.grupoId) {
            fetchResources();
        } else {
            // If no grupoId, stop loading and show error
            setIsLoadingResources(false);
            setError('Debe estar asignado a un grupo para crear proyectos.');
        }
    }, [userData]);

    const fetchResources = async () => {
        try {
            setIsLoadingResources(true);
            const [teachersRes, studentsRes] = await Promise.all([
                api.get(`/api/teams/available-teachers?groupId=${userData.grupoId}`),
                api.get(`/api/teams/available-students?groupId=${userData.grupoId}`)
            ]);
            setAvailableTeachers(teachersRes.data);
            setAvailableStudents(studentsRes.data);
        } catch (err) {
            console.error('Error fetching resources:', err);
            setError('Error al cargar listas.');
        } finally {
            setIsLoadingResources(false);
        }
    };

    const toggleStudent = (studentId) => {
        setForm(prev => {
            const currentMembers = prev.miembrosIds;
            if (currentMembers.includes(studentId)) {
                return { ...prev, miembrosIds: currentMembers.filter(id => id !== studentId) };
            } else {
                if (currentMembers.length >= 4) return prev;
                return { ...prev, miembrosIds: [...currentMembers, studentId] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        if (!form.docenteId) {
            setError('Debes seleccionar un docente asesor.');
            setLoading(false);
            return;
        }

        try {
            const selectedTeacher = availableTeachers.find(t => t.id === form.docenteId);
            await api.post('/api/projects', {
                titulo: form.titulo,
                materia: selectedTeacher?.asignatura || form.materia,
                materiaId: selectedTeacher?.materiaId || 'MAT-DEFAULT',
                docenteId: form.docenteId,
                ciclo: form.ciclo,
                liderId: userData.userId,
                liderNombre: userData.nombre,
                grupoId: userData.grupoId,
                stackTecnologico: form.stackTecnologico.split(',').map(s => s.trim()).filter(Boolean),
                miembrosIds: form.miembrosIds,
                // videoUrl: form.videoUrl // API doesn't support yet, but UI does.
            });
            onSuccess();
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err.response?.data?.message || 'Error al crear proyecto');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (!form.titulo) {
            setError('El título es obligatorio');
            return;
        }
        setError('');
        setStep(2);
    };

    const filteredStudents = availableStudents
        .filter(s => s.id !== userData.userId)
        .filter(s => s.nombreCompleto.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.matricula.toLowerCase().includes(studentSearch.toLowerCase()));

    const filteredTeachers = availableTeachers.filter(t =>
        t.nombreCompleto.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#F0F0F3] p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {step === 1 ? 'Nuevo Proyecto' : 'Añadir Integrantes'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 1 ? 'Detalles generales y asesor.' : 'Busca y selecciona a tu equipo.'}
                    </p>
                </div>
                <button onClick={onClose} className="neu-icon-btn w-10 h-10 bg-[#F0F0F3]">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-1 py-2">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Inputs Group - Neumorphic Sunken */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-3 ml-2">Nombre del Proyecto</label>
                                    <div className="neu-pressed rounded-2xl px-4 py-3 flex items-center gap-3">
                                        <Layout size={20} className="text-gray-400" />
                                        <input
                                            type="text"
                                            value={form.titulo}
                                            onChange={e => setForm({ ...form, titulo: e.target.value })}
                                            placeholder="Sistema de Gestión Kiosko Integradora"
                                            className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-3 ml-2">Asignar Docente</label>

                                    {/* Teacher Search Input */}
                                    <div className="neu-pressed rounded-2xl px-4 py-2 mb-3 flex items-center gap-3">
                                        <Search size={16} className="text-gray-400" />
                                        <input
                                            type="text"
                                            value={teacherSearch}
                                            onChange={e => setTeacherSearch(e.target.value)}
                                            placeholder="Buscar docente..."
                                            className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400 text-sm"
                                        />
                                    </div>

                                    <div className="neu-pressed rounded-2xl p-2 min-h-[120px] max-h-40 overflow-y-auto">
                                        {isLoadingResources ? (
                                            <div className="flex items-center justify-center h-full py-8">
                                                <div className="text-gray-400 text-sm">Cargando docentes...</div>
                                            </div>
                                        ) : filteredTeachers.length === 0 ? (
                                            <div className="flex items-center justify-center h-full py-8">
                                                <div className="text-gray-400 text-sm">No se encontraron docentes</div>
                                            </div>
                                        ) : (
                                            filteredTeachers.map(teacher => (
                                                <div
                                                    key={teacher.id}
                                                    onClick={() => setForm({ ...form, docenteId: teacher.id })}
                                                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between mb-2 last:mb-0 ${form.docenteId === teacher.id ? 'neu-flat bg-[#F0F0F3] text-blue-600' : 'hover:bg-gray-200/50 text-gray-500'
                                                        }`}
                                                >
                                                    <span className="font-semibold text-sm">{teacher.nombreCompleto}</span>
                                                    {form.docenteId === teacher.id && <Check size={16} />}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>


                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Search Sunken */}
                            <div className="neu-pressed rounded-2xl px-4 py-3 flex items-center gap-3">
                                <Search size={20} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    placeholder="Buscar: 2406..."
                                    className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
                                    autoFocus
                                />
                            </div>

                            {/* Results List Raised */}
                            <div className="space-y-4">
                                {/* Leader Row */}
                                <div className="neu-flat rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-blue-600 font-bold bg-[#F0F0F3]">
                                        {userData.nombre?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{userData.nombre}</p>
                                        <p className="text-xs text-gray-500">Líder del Proyecto</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">Líder</span>
                                </div>

                                {/* Results */}
                                {filteredStudents.map(student => {
                                    const isSelected = form.miembrosIds.includes(student.id);
                                    return (
                                        <div key={student.id} className="neu-flat rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                                {student.nombreCompleto.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">{student.nombreCompleto}</p>
                                                <p className="text-xs text-gray-500">{student.matricula}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleStudent(student.id)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isSelected
                                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                    : 'neu-pressed text-blue-600 hover:text-blue-700'
                                                    }`}
                                            >
                                                {isSelected ? 'Quitar' : 'Añadir'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-4 p-3 bg-red-100/50 text-red-600 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-gray-200/20">
                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="text-gray-500 font-bold hover:text-gray-700 px-4"
                    >
                        Atrás
                    </button>
                )}

                {step === 1 ? (
                    <button
                        onClick={nextStep}
                        className="neu-flat px-8 py-3 rounded-xl font-bold text-blue-600 hover:text-blue-700 active:neu-pressed transition-all flex items-center gap-2"
                    >
                        Siguiente
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="neu-flat px-8 py-3 rounded-xl font-bold text-green-600 hover:text-green-700 active:neu-pressed transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Proyecto'}
                        <Check size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
