import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Crown, ChevronRight, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';
import { ProjectDetailsModal } from '../../projects/components/ProjectDetailsModal';

// --- Particle Background (Canvas Optimized) ---
const ParticleBackground = () => {
    useEffect(() => {
        const canvas = document.getElementById('ranking-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        const particleCount = 40;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.init();
            }
            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.3 - 0.15;
                this.speedY = Math.random() * 0.3 - 0.15;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas id="ranking-particles" className="fixed inset-0 pointer-events-none opacity-40 z-0" />;
};

const Spotlight = () => (
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0">
        <div className="w-full h-full rounded-full bg-white/[0.04] blur-[120px] animate-pulse" />
    </div>
);

export function RankingPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' (placeholder for daily/monthly structure)

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            const response = await api.get('/api/projects/public');
            // Sort by Total Points Descending
            const sorted = response.data.sort((a, b) => (b.puntosTotales || 0) - (a.puntosTotales || 0));
            setProjects(sorted);
        } catch (error) {
            console.error('Error fetching ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/50 font-medium tracking-widest text-xs uppercase italic">Cargando Ranking</p>
            </div>
        </div>
    );

    const top3 = projects.slice(0, 3);
    // Determine the position of the projects in the podium: [2nd, 1st, 3rd]
    const podiumProjects = [
        { project: top3[1], rank: 2 },
        { project: top3[0], rank: 1 },
        { project: top3[2], rank: 3 }
    ].filter(p => p.project);

    const rest = projects.slice(3, 30);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-20 overflow-x-hidden pt-10">
            <ParticleBackground />
            <Spotlight />
            {/* Header Section */}
            <div className="relative pt-20 pb-16 px-4 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black tracking-widest uppercase">
                            <Trophy size={14} className="text-white" />
                            Official Leaderboard
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
                            <span className="bg-gradient-to-t from-white/10 via-white/80 to-white bg-clip-text text-transparent">RANKING</span> <span className="text-white/20">PROYECTOS</span>
                        </h1>
                        <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium tracking-tight">
                            Explora los proyectos de mayor impacto evaluados por la comunidad académica.
                        </p>
                    </motion.div>

                    {/* Filter Tabs (Structural for future) */}
                    <div className="flex justify-center mt-12">
                        <div className="inline-flex p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            {['all', 'daily', 'monthly'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-10 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                                        filter === t 
                                        ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {t === 'all' ? 'General' : t === 'daily' ? 'Diario' : 'Mensual'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 relative">
                {/* Spotlight focused on #1 */}
                <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0">
                    <div className="w-full h-full rounded-full bg-white/[0.05] blur-[120px] animate-pulse" />
                </div>

                {/* 3D PODIUM */}
                <div className="relative flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 mt-16 mb-32 min-h-[480px] z-10">
                    {podiumProjects.map(({ project, rank }, idx) => (
                        <PodiumCard 
                            key={project.id}
                            project={project} 
                            rank={rank} 
                            height={rank === 1 ? "h-[380px]" : rank === 2 ? "h-[300px]" : "h-[250px]"} 
                            delay={idx * 0.1}
                            featured={rank === 1}
                            onOpen={() => setSelectedProject(project)}
                        />
                    ))}
                </div>

                {/* RANKING LIST */}
                <div className="space-y-3 relative">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">
                        <div className="col-span-1">RANK</div>
                        <div className="col-span-8 md:col-span-7">PROYECTO</div>
                        <div className="hidden md:block col-span-2">LÍDER</div>
                        <div className="col-span-3 md:col-span-2 text-right">SCORE</div>
                    </div>

                    {rest.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedProject(project)}
                            className="group grid grid-cols-12 items-center px-8 py-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 cursor-pointer"
                        >
                            <div className="col-span-1 font-black text-2xl text-white/10 group-hover:text-white/40 transition-colors">
                                {index + 4}
                            </div>
                            <div className="col-span-8 md:col-span-7 pr-6">
                                <div className="font-black text-xl tracking-tight group-hover:translate-x-1 transition-transform duration-500 uppercase">{project.titulo}</div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="text-[10px] font-black tracking-widest text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {project.materia}
                                    </div>
                                    <div className="md:hidden text-[10px] text-white/40 font-bold uppercase truncate max-w-[150px]">
                                        {project.liderNombre}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-2 items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 group-hover:border-white/30 transition-colors">
                                    {project.liderFotoUrl ? (
                                        <img src={project.liderFotoUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    ) : (
                                        <span className="text-[10px] font-black text-white/40 uppercase">{project.liderNombre?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-white/40 group-hover:text-white/70 transition-colors truncate">{project.liderNombre}</span>
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right">
                                <div className="text-2xl font-black group-hover:scale-110 transition-transform origin-right">{project.puntosTotales}</div>
                                <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">puntos</div>
                            </div>
                        </motion.div>
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <p className="text-white/20 font-black tracking-widest uppercase italic">No hay proyectos registrados aún</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDetailsModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .floating {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

function PodiumCard({ project, rank, height, delay, featured = false, onOpen }) {
    const Icon = rank === 1 ? Crown : rank === 2 ? Medal : Star;
    const borderClass = rank === 1 ? 'border-white/40' : 'border-white/10';
    const bgClass = rank === 1 
        ? 'bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent' 
        : 'bg-white/[0.02]';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className={`relative flex flex-col items-center w-full md:w-72 group cursor-pointer ${featured ? 'z-20 scale-105 md:scale-110 mb-4 md:mb-8' : 'z-10 opacity-70 hover:opacity-100'}`}
            onClick={onOpen}
        >
            {/* Avatar Section */}
            <div className="relative mb-10">
                <motion.div 
                    whileHover={{ y: -10 }}
                    className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 border-2 transition-all duration-700 shadow-[0_0_50px_rgba(255,255,255,0.05)] ${
                        rank === 1 ? 'border-white scale-110 bg-white/10' : 'border-white/20'
                    }`}
                >
                    <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative border border-white/5 flex items-center justify-center">
                        {project.liderFotoUrl ? (
                            <img src={project.liderFotoUrl} alt={project.liderNombre} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" />
                        ) : (
                            <span className="text-4xl font-black text-white/40 uppercase italic select-none">
                                {project.liderNombre?.charAt(0) || project.titulo?.charAt(0) || 'U'}
                            </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                            <span className="text-[10px] font-black tracking-widest uppercase">Ver Proyecto</span>
                        </div>
                    </div>
                </motion.div>
                
                {/* Floating Rank Badge */}
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl backdrop-blur-xl transition-transform duration-500 group-hover:scale-110 ${
                    rank === 1 ? 'bg-white text-black' : 'bg-neutral-900 text-white border border-white/20'
                }`}>
                    <Icon size={14} fill={rank === 1 ? "black" : "none"} />
                    TOP {rank}
                </div>
            </div>

            {/* Platform (Structure) */}
            <div className={`w-full overflow-hidden transition-all duration-700 rounded-3xl border ${borderClass} ${bgClass} ${height} backdrop-blur-sm shadow-2xl flex flex-col`}>
                <div className="p-8 flex flex-col items-center flex-1">
                    <h3 className={`font-black tracking-tighter mb-2 text-center line-clamp-2 uppercase transition-all duration-500 ${rank === 1 ? 'text-2xl' : 'text-xl'}`}>
                        {project.titulo}
                    </h3>
                    <div className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-8 text-center px-4 line-clamp-1">
                        {project.liderNombre}
                    </div>
                    
                    <div className="mt-auto w-full pt-8 border-t border-white/5 space-y-1">
                        <div className={`font-black tabular-nums transition-all duration-700 ${rank === 1 ? 'text-5xl group-hover:scale-110' : 'text-4xl'}`}>
                            {project.puntosTotales}
                        </div>
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                            PUNTOS
                        </div>
                    </div>
                </div>

                {/* Aesthetic Detail at bottom */}
                <div className="h-1 w-2/3 mx-auto bg-white/5 rounded-full mb-4"></div>
            </div>

            {/* Reflection Shadow */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </motion.div>
    );
}
