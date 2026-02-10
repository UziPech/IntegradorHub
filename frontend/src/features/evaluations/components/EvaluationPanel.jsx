import { useState, useEffect } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';

export function EvaluationPanel({ projectId }) {
    const { userData } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [tipo, setTipo] = useState('sugerencia');
    const [contenido, setContenido] = useState('');
    const [calificacion, setCalificacion] = useState(80);

    const isDocente = userData?.rol === 'Docente';

    useEffect(() => {
        fetchEvaluations();
    }, [projectId]);

    const fetchEvaluations = async () => {
        try {
            const response = await api.get(`/api/evaluations/project/${projectId}`);
            setEvaluations(response.data);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contenido.trim()) return;

        setSubmitting(true);
        try {
            await api.post('/api/evaluations', {
                projectId,
                docenteId: userData.id,
                docenteNombre: userData.nombre,
                tipo,
                contenido,
                calificacion: tipo === 'oficial' ? calificacion : null
            });

            setContenido('');
            setCalificacion(80);
            fetchEvaluations();
        } catch (error) {
            console.error('Error creating evaluation:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Calcular calificación promedio de evaluaciones oficiales
    const oficialEvals = evaluations.filter(e => e.tipo === 'oficial' && e.calificacion);
    const promedioCalif = oficialEvals.length > 0
        ? Math.round(oficialEvals.reduce((sum, e) => sum + e.calificacion, 0) / oficialEvals.length)
        : null;

    return (
        <div className="border-t border-gray-100 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Evaluaciones
                </h3>
                {promedioCalif !== null && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-blue-700">{promedioCalif}/100</span>
                    </div>
                )}
            </div>

            {/* Lista de evaluaciones */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-4 text-gray-400">Cargando...</div>
                ) : evaluations.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">No hay evaluaciones aún</div>
                ) : (
                    evaluations.map(evaluation => (
                        <div
                            key={evaluation.id}
                            className={`p-4 rounded-xl border ${evaluation.tipo === 'oficial'
                                    ? 'bg-blue-50 border-blue-100'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{evaluation.docenteNombre}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${evaluation.tipo === 'oficial'
                                            ? 'bg-blue-200 text-blue-800'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {evaluation.tipo === 'oficial' ? 'Oficial' : 'Sugerencia'}
                                    </span>
                                </div>
                                {evaluation.calificacion && (
                                    <span className="text-sm font-bold text-blue-600">{evaluation.calificacion}/100</span>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm">{evaluation.contenido}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(evaluation.createdAt).toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario para docentes */}
            {isDocente && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipo"
                                value="sugerencia"
                                checked={tipo === 'sugerencia'}
                                onChange={() => setTipo('sugerencia')}
                                className="text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Sugerencia</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipo"
                                value="oficial"
                                checked={tipo === 'oficial'}
                                onChange={() => setTipo('oficial')}
                                className="text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Evaluación Oficial</span>
                        </label>
                    </div>

                    {tipo === 'oficial' && (
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Calificación:</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={calificacion}
                                onChange={e => setCalificacion(parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-lg font-bold text-blue-600 w-12 text-right">{calificacion}</span>
                        </div>
                    )}

                    <textarea
                        value={contenido}
                        onChange={e => setContenido(e.target.value)}
                        placeholder={tipo === 'oficial' ? 'Escribe tu evaluación...' : 'Escribe una sugerencia para el equipo...'}
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                    />

                    <button
                        type="submit"
                        disabled={!contenido.trim() || submitting}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send size={16} />
                        {submitting ? 'Enviando...' : (tipo === 'oficial' ? 'Enviar Evaluación' : 'Enviar Sugerencia')}
                    </button>
                </form>
            )}
        </div>
    );
}
