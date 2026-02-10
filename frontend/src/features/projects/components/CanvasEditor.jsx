import { useState, useEffect, useRef } from 'react';
import {
    Plus, GripVertical, Trash2, Image as ImageIcon,
    Type, Heading1, Heading2, List, Code, CheckSquare, Quote, Minus
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';

// Tipos de bloques soportados
const BLOCK_TYPES = {
    TEXT: 'text',
    H1: 'h1',
    H2: 'h2',
    H3: 'h3',
    BULLET: 'bullet',
    TODO: 'todo',
    IMAGE: 'image',
    CODE: 'code',
    QUOTE: 'quote',
    DIVIDER: 'divider'
};

const BLOCK_MENU = [
    { type: BLOCK_TYPES.TEXT, icon: Type, label: 'Texto' },
    { type: BLOCK_TYPES.H1, icon: Heading1, label: 'Título 1' },
    { type: BLOCK_TYPES.H2, icon: Heading2, label: 'Título 2' },
    { type: BLOCK_TYPES.BULLET, icon: List, label: 'Lista' },
    { type: BLOCK_TYPES.TODO, icon: CheckSquare, label: 'Tarea' },
    { type: BLOCK_TYPES.QUOTE, icon: Quote, label: 'Cita' },
    { type: BLOCK_TYPES.CODE, icon: Code, label: 'Código' },
    { type: BLOCK_TYPES.DIVIDER, icon: Minus, label: 'Separador' },
    { type: BLOCK_TYPES.IMAGE, icon: ImageIcon, label: 'Imagen' }
];

export function CanvasEditor({ project, readOnly = false }) {
    const { userData } = useAuth();
    const [blocks, setBlocks] = useState(project.canvas || project.canvasBlocks || []);
    const [saving, setSaving] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState(null);
    const saveTimeoutRef = useRef(null);

    // Auto-save con debounce
    useEffect(() => {
        if (readOnly) return;
        
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(async () => {
            if (blocks.length === 0) return;
            
            setSaving(true);
            try {
                await api.put(`/api/projects/${project.id}/canvas`, {
                    blocks,
                    userId: userData.id
                });
            } catch (err) {
                console.error('Error saving canvas:', err);
            } finally {
                setSaving(false);
            }
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [blocks, project.id, userData?.id, readOnly]);

    const handleBlockChange = (id, newContent) => {
        if (readOnly) return;
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
    };

    const handleBlockMetadataChange = (id, metadata) => {
        if (readOnly) return;
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, metadata: { ...b.metadata, ...metadata } } : b));
    };

    const addBlock = (type, afterIndex) => {
        const newBlock = {
            id: crypto.randomUUID(),
            type,
            content: '',
            metadata: {}
        };

        const newBlocks = [...blocks];
        newBlocks.splice(afterIndex + 1, 0, newBlock);
        setBlocks(newBlocks);
        setShowBlockMenu(null);
    };

    const removeBlock = (id) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const moveBlock = (fromIndex, toIndex) => {
        const newBlocks = [...blocks];
        const [removed] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, removed);
        setBlocks(newBlocks);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Status Bar */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className={`
                    px-4 py-2 rounded-full shadow-lg border
                    transition-all duration-300
                    ${saving 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-500 border-gray-200'
                    }
                `}>
                    <span className="text-sm font-medium">
                        {saving ? 'Guardando...' : 'Guardado'}
                    </span>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="max-w-3xl mx-auto px-6 py-16">
                {/* Title Section */}
                {!readOnly && (
                    <div className="mb-12">
                        <h1 className="text-5xl font-bold text-gray-900 mb-2">
                            {project.titulo}
                        </h1>
                        <p className="text-lg text-gray-500">{project.materia}</p>
                    </div>
                )}

                {/* Blocks */}
                <div className="space-y-1">
                    {blocks.map((block, index) => (
                        <Block
                            key={block.id}
                            block={block}
                            index={index}
                            onChange={(content) => handleBlockChange(block.id, content)}
                            onMetadataChange={(metadata) => handleBlockMetadataChange(block.id, metadata)}
                            onRemove={() => removeBlock(block.id)}
                            onShowMenu={() => setShowBlockMenu(index)}
                            onAddBlock={(type) => addBlock(type, index)}
                            showMenu={showBlockMenu === index}
                            onCloseMenu={() => setShowBlockMenu(null)}
                            readOnly={readOnly}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {blocks.length === 0 && !readOnly && (
                    <button
                        onClick={() => addBlock(BLOCK_TYPES.TEXT, -1)}
                        className="w-full py-16 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-gray-600">
                            <Plus size={32} />
                            <span className="text-lg font-medium">Haz clic para empezar a escribir</span>
                        </div>
                    </button>
                )}

                {/* Add Block Button (at the end) */}
                {!readOnly && blocks.length > 0 && (
                    <button
                        onClick={() => addBlock(BLOCK_TYPES.TEXT, blocks.length - 1)}
                        className="mt-4 w-full py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        <span className="text-sm font-medium">Agregar bloque</span>
                    </button>
                )}
            </div>
        </div>
    );
}

function Block({ 
    block, 
    index,
    onChange, 
    onMetadataChange,
    onRemove, 
    onShowMenu,
    onAddBlock,
    showMenu,
    onCloseMenu,
    readOnly 
}) {
    const textAreaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    }, [block.content]);

    const renderInput = () => {
        const baseClasses = "w-full bg-transparent outline-none resize-none overflow-hidden";
        const placeholderClasses = "placeholder:text-gray-300";

        switch (block.type) {
            case BLOCK_TYPES.H1:
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-4xl font-bold text-gray-900 leading-tight`}
                        placeholder="Título principal"
                        readOnly={readOnly}
                        rows={1}
                    />
                );

            case BLOCK_TYPES.H2:
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-3xl font-bold text-gray-900 leading-tight`}
                        placeholder="Subtítulo"
                        readOnly={readOnly}
                        rows={1}
                    />
                );

            case BLOCK_TYPES.H3:
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-2xl font-semibold text-gray-900`}
                        placeholder="Encabezado"
                        readOnly={readOnly}
                        rows={1}
                    />
                );

            case BLOCK_TYPES.BULLET:
                return (
                    <div className="flex gap-3 items-start">
                        <span className="text-xl leading-7 text-gray-400 select-none">•</span>
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-base text-gray-700 leading-7`}
                            placeholder="Elemento de lista"
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.TODO:
                return (
                    <div className="flex gap-3 items-start">
                        <input
                            type="checkbox"
                            checked={block.metadata?.checked || false}
                            onChange={e => onMetadataChange({ checked: e.target.checked })}
                            className="mt-2 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            disabled={readOnly}
                        />
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-base text-gray-700 leading-7 ${block.metadata?.checked ? 'line-through text-gray-400' : ''}`}
                            placeholder="Tarea por hacer"
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.QUOTE:
                return (
                    <div className="border-l-4 border-gray-900 pl-6 py-2">
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-lg text-gray-700 italic leading-relaxed`}
                            placeholder="Escribe una cita..."
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.CODE:
                return (
                    <div className="bg-gray-900 rounded-2xl p-6 font-mono">
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className="w-full bg-transparent outline-none resize-none text-sm text-green-400 leading-relaxed"
                            placeholder="// Escribe tu código aquí..."
                            readOnly={readOnly}
                            rows={3}
                        />
                    </div>
                );

            case BLOCK_TYPES.DIVIDER:
                return (
                    <div className="py-4">
                        <div className="h-px bg-gray-200" />
                    </div>
                );

            case BLOCK_TYPES.IMAGE:
                return (
                    <div className="py-2">
                        {block.content ? (
                            <img 
                                src={block.content} 
                                alt="Block" 
                                className="w-full rounded-2xl"
                            />
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                                <ImageIcon className="mx-auto text-gray-300 mb-3" size={32} />
                                <input
                                    type="text"
                                    value={block.content}
                                    onChange={e => onChange(e.target.value)}
                                    placeholder="Pega la URL de la imagen"
                                    className="w-full text-center text-sm text-gray-500 bg-transparent outline-none"
                                    readOnly={readOnly}
                                />
                            </div>
                        )}
                    </div>
                );

            default: // TEXT
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-base text-gray-700 leading-relaxed`}
                        placeholder="Escribe algo..."
                        readOnly={readOnly}
                        rows={1}
                    />
                );
        }
    };

    return (
        <div className="group relative flex items-start -ml-16 pl-16 py-2 hover:bg-gray-50/50 rounded-lg transition-colors">
            {/* Left Controls */}
            {!readOnly && (
                <div className="absolute left-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onShowMenu}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        className="p-1.5 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical size={18} />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {/* Block Content */}
            <div className="flex-1 min-w-0">
                {renderInput()}
            </div>

            {/* Block Type Menu */}
            {showMenu && (
                <div className="absolute left-16 top-12 z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[200px]">
                    <div className="grid grid-cols-1 gap-1">
                        {BLOCK_MENU.map(({ type, icon: Icon, label }) => (
                            <button
                                key={type}
                                onClick={() => onAddBlock(type)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                            >
                                <Icon size={18} className="text-gray-400" />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
