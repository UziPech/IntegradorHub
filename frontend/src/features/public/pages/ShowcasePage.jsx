import { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import api from '../../../lib/axios';

export function ShowcasePage() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStack, setSelectedStack] = useState(null);
    const [allStacks, setAllStacks] = useState([]);

    useEffect(() => {
        fetchPublicProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [searchTerm, selectedStack, projects]);

    const fetchPublicProjects = async () => {
        try {
            const response = await api.get('/api/projects/public');
            setProjects(response.data);
            
            // Extract unique stacks
            const stacks = new Set();
            response.data.forEach(p => {
                p.stackTecnologico?.forEach(tech => stacks.add(tech));
            });
            setAllStacks(Array.from(stacks).sort());
        } catch (error) {
            console.error('Error fetching public projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProjects = () => {
        let filtered = projects;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.materia.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by stack
        if (selectedStack) {
            filtered = filtered.filter(p =>
                p.stackTecnologico?.includes(selectedStack)
            );
        }

        setFilteredProjects(filtered);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <header className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Galería de Proyectos
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Descubre los proyectos integradores de Desarrollo de Software Multiplataforma
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar proyectos..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Stack Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter size={20} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filtrar por tecnología:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedStack(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedStack === null
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todas
                        </button>
                        {allStacks.map(stack => (
                            <button
                                key={stack}
                                onClick={() => setSelectedStack(stack)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedStack === stack
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {stack}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'}
                        {selectedStack && ` con ${selectedStack}`}
                    </p>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <Card className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No se encontraron proyectos
                        </h3>
                        <p className="text-gray-500">
                            Intenta con otros términos de búsqueda o filtros
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => (
                            <PublicProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
                    <p>Universidad Tecnológica Metropolitana - DSM</p>
                </div>
            </footer>
        </div>
    );
}

function PublicProjectCard({ project }) {
    return (
        <Card hover className="p-6 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-2xl">🚀</span>
                </div>
                <Badge variant="success">Público</Badge>
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {project.titulo}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{project.materia}</p>

            {/* Stack */}
            {project.stackTecnologico && project.stackTecnologico.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {project.stackTecnologico.slice(0, 4).map((tech, i) => (
                        <span
                            key={i}
                            className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.stackTecnologico.length > 4 && (
                        <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg">
                            +{project.stackTecnologico.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 transition-colors group/btn">
                    <span className="text-sm font-medium">Ver proyecto</span>
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </Card>
    );
}
