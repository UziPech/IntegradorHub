import { useState } from 'react';
import { Play, Users, BookOpen, ExternalLink, Calendar } from 'lucide-react';

export function ShowcaseCard({ project, onClick }) {
    const [isPlaying, setIsPlaying] = useState(false);

    // 1. Determine Media (Video > Thumbnail > First Image or Placeholder)
    const videoUrl = project.videoUrl;
    const firstImageBlock = project.canvas?.find(b => b.type === 'image');
    const imageUrl = project.thumbnailUrl || firstImageBlock?.content || null;

    // 2. Determine Description (Project Description or First Text Block)
    // DTO now sends 'descripcion' field which is extracted from canvas text
    const description = project.descripcion || 'Sin descripción disponible. Navega a los detalles para ver más.';

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[400px]"
        >
            {/* LEFT: Media Section (Video or Image) - 50% width on Desktop */}
            <div className="w-full lg:w-1/2 bg-gray-900 relative overflow-hidden flex items-center justify-center">

                {/* Priority: Video Pitch */}
                {videoUrl ? (
                    isPlaying ? (
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <div className="relative w-full h-full">
                            {/* If we have a thumbnail for the video, default to project image, else black */}
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={project.titulo}
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                            )}

                            {/* Play Button Overlay */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(true);
                                }}
                                className="absolute inset-0 flex items-center justify-center group/play"
                            >
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover/play:bg-white/20 transition-all group-hover/play:scale-110">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg text-gray-900">
                                        <Play fill="currentColor" size={24} />
                                    </div>
                                </div>
                            </button>
                            <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                                Video Pitch
                            </span>
                        </div>
                    )
                ) : (
                    /* Fallback: Image Only */
                    imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={project.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 p-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                                <span className="text-3xl">👻</span>
                            </div>
                            <p className="text-sm font-medium text-gray-400">Sin contenido visual</p>
                        </div>
                    )
                )}
            </div>

            {/* RIGHT: Content Section */}
            <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-between relative bg-white">

                {/* Header: Status & Course */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${project.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-100' :
                            project.estado === 'Activo' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-gray-50 text-gray-600 border-gray-100'
                            }`}>
                            {project.estado || 'Borrador'}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                    {project.titulo || 'Proyecto sin título'}
                </h3>

                {/* Scrollable Description */}
                <div className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar max-h-32 lg:max-h-40">
                    <p className="text-gray-600 text-base leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.stackTecnologico?.slice(0, 5).map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                            {tech}
                        </span>
                    ))}
                    {(project.stackTecnologico?.length || 0) > 5 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg border border-gray-100">
                            +{project.stackTecnologico.length - 5}
                        </span>
                    )}
                </div>

                {/* Footer: Team & Advisor */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    {/* Team Avatars */}
                    <div className="flex -space-x-3 hover:space-x-1 transition-all pl-2">
                        {project.miembrosIds?.map((id, index) => (
                            <div key={index} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-help"
                                title={`Miembro ${index + 1}`}
                            >
                                <span>{index + 1}</span>
                            </div>
                        ))}

                        {/* Advisor if available */}
                        {project.docenteNombre && (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-help"
                                title={`Asesor: ${project.docenteNombre}`}
                            >
                                <Users size={16} />
                            </div>
                        )}

                        {/* Lider (Always present) */}
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-help"
                            title={`Líder: ${project.liderNombre}`}
                        >
                            {project.liderNombre?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <button className="flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Ver Detalles
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
