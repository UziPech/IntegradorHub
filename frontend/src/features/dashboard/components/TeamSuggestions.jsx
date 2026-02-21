import { Code } from 'lucide-react';
import { motion } from 'framer-motion';

export function TeamSuggestions({ suggestions }) {
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Encuentra a tu equipo</h3>
                    <p className="text-sm text-gray-500">Compañeros sin equipo en tu grupo</p>
                </div>
            </div>

            <div className="space-y-4">
                {suggestions.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold uppercase shrink-0">
                                {student.nombre?.substring(0, 2) || 'US'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{student.nombre}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        <Code size={10} />
                                        {student.carrera || 'Ingeniería'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-center hidden">
                Ver todos
            </button>
        </div>
    );
}
