import { useState, useEffect, useRef } from 'react';
import {
    Plus, GripVertical, Trash2, Image as ImageIcon,
    Type, Heading1, Heading2, List, CaseSensitive, CheckSquare, Quote, Minus, Loader
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../lib/axios';

// Firebase Storage
import { storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    { type: BLOCK_TYPES.H3, icon: CaseSensitive, label: 'Encabezado' },
    { type: BLOCK_TYPES.BULLET, icon: List, label: 'Lista' },
    { type: BLOCK_TYPES.TODO, icon: CheckSquare, label: 'Tarea' },
    { type: BLOCK_TYPES.QUOTE, icon: Quote, label: 'Cita' },
    { type: BLOCK_TYPES.DIVIDER, icon: Minus, label: 'Separador' },
    { type: BLOCK_TYPES.IMAGE, icon: ImageIcon, label: 'Imagen' }
];

export function CanvasEditor({ project, readOnly = false }) {
    const { userData } = useAuth();
    const [blocks, setBlocks] = useState(project.canvas || project.canvasBlocks || []);
    const [saving, setSaving] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState(null);
    const saveTimeoutRef = useRef(null);

    // Drag & Drop State
    const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);

    useEffect(() => {
        if (blocks.length === 0 && !readOnly) {
            // Default empty block
            setBlocks([{ id: crypto.randomUUID(), type: BLOCK_TYPES.TEXT, content: '', metadata: {} }]);
        }
    }, []);

    // Auto-save con debounce
    useEffect(() => {
        if (readOnly) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            // Validate basic content before saving
            if (blocks.length === 0) return;

            setSaving(true);
            try {
                await api.put(`/api/projects/${project.id}/canvas`, {
                    blocks,
                    userId: userData.userId // Ensure using correct userId property
                });
            } catch (err) {
                console.error('Error saving canvas:', err);
            } finally {
                setSaving(false);
            }
        }, 1500);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [blocks, project.id, userData.userId, readOnly]);

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

    // Drag & Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedBlockIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag image transparent or custom if needed
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedBlockIndex === null || draggedBlockIndex === index) return;

        const newBlocks = [...blocks];
        const draggedBlock = newBlocks[draggedBlockIndex];

        // Remove from old position
        newBlocks.splice(draggedBlockIndex, 1);
        // Insert at new position
        newBlocks.splice(index, 0, draggedBlock);

        setBlocks(newBlocks);
        setDraggedBlockIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedBlockIndex(null);
    };

    const handleImageUpload = async (file, blockId) => {
        if (!file) return;

        // Optimistic update: Show loading state in metadata
        handleBlockMetadataChange(blockId, { uploading: true });

        try {
            const storageRef = ref(storage, `project-assets/${project.id}/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            handleBlockChange(blockId, downloadUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            handleBlockMetadataChange(blockId, { uploading: false });
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Status Bar */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className={`
                    px-4 py-2 rounded-full shadow-lg border flex items-center gap-2
                    transition-all duration-300
                    ${saving
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-500 border-gray-200'
                    }
                `}>
                    {saving && <Loader size={12} className="animate-spin" />}
                    <span className="text-sm font-medium">
                        {saving ? 'Guardando...' : 'Guardado'}
                    </span>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Title Section */}
                {!readOnly && (
                    <div className="mb-12 group">
                        <input
                            value={project.titulo} // Titles are usually handled by project settings, but we display it here
                            readOnly
                            className="text-5xl font-bold text-gray-900 mb-2 w-full outline-none bg-transparent placeholder-gray-300"
                        />
                        <p className="text-lg text-gray-500">{project.materia} • {project.ciclo}</p>
                    </div>
                )}

                {/* Blocks */}
                <div className="space-y-2">
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
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onImageUpload={(file) => handleImageUpload(file, block.id)}
                        />
                    ))}
                </div>

                {/* Empty State / Start Prompt */}
                {blocks.length === 0 && !readOnly && (
                    <button
                        onClick={() => addBlock(BLOCK_TYPES.TEXT, -1)}
                        className="w-full py-16 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                        <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-gray-600">
                            <Plus size={32} />
                            <span className="text-lg font-medium">Comienza escribiendo tu documentacion...</span>
                        </div>
                    </button>
                )}

                {/* Add Block Button (at the end) */}
                {!readOnly && blocks.length > 0 && (
                    <div className="mt-8 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => addBlock(BLOCK_TYPES.TEXT, blocks.length - 1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-full transition-all"
                        >
                            <Plus size={18} />
                            <span className="text-sm font-medium">Agregar bloque al final</span>
                        </button>
                    </div>
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
    readOnly,
    onDragStart,
    onDragOver,
    onDragEnd,
    onImageUpload
}) {
    const textAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    }, [block.content]);

    const renderInput = () => {
        const baseClasses = "w-full bg-transparent outline-none resize-none overflow-hidden block transition-colors";
        const placeholderClasses = "placeholder:text-gray-300";

        switch (block.type) {
            case BLOCK_TYPES.H1:
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-4xl font-bold text-gray-900 leading-tight mt-6 mb-4`}
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
                        className={`${baseClasses} ${placeholderClasses} text-2xl font-bold text-gray-800 leading-tight mt-6 mb-3`}
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
                        className={`${baseClasses} ${placeholderClasses} text-xl font-semibold text-gray-700 leading-tight mt-4 mb-2`}
                        placeholder="Encabezado"
                        readOnly={readOnly}
                        rows={1}
                    />
                );

            case BLOCK_TYPES.BULLET:
                return (
                    <div className="flex gap-3 items-start my-1">
                        <span className="text-xl leading-7 text-gray-400 select-none">•</span>
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-lg text-gray-700 leading-relaxed`}
                            placeholder="Elemento de lista"
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.TODO:
                return (
                    <div className="flex gap-3 items-start my-1">
                        <input
                            type="checkbox"
                            checked={block.metadata?.checked || false}
                            onChange={e => onMetadataChange({ checked: e.target.checked })}
                            className="mt-1.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            disabled={readOnly}
                        />
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-lg text-gray-700 leading-relaxed ${block.metadata?.checked ? 'line-through text-gray-400' : ''}`}
                            placeholder="Tarea por hacer"
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.QUOTE:
                return (
                    <div className="border-l-4 border-gray-900 pl-6 py-2 my-4 bg-gray-50/50 rounded-r-xl">
                        <textarea
                            ref={textAreaRef}
                            value={block.content}
                            onChange={e => onChange(e.target.value)}
                            className={`${baseClasses} ${placeholderClasses} text-xl text-gray-700 italic leading-relaxed`}
                            placeholder="Escribe una cita..."
                            readOnly={readOnly}
                            rows={1}
                        />
                    </div>
                );

            case BLOCK_TYPES.DIVIDER:
                return (
                    <div className="py-8 flex items-center justify-center">
                        <div className="w-24 h-1 bg-gray-200 rounded-full" />
                    </div>
                );

            case BLOCK_TYPES.IMAGE:
                return (
                    <div className="py-4">
                        {block.content ? (
                            <div className="relative group/image rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                    src={block.content}
                                    alt="Block"
                                    className="w-full h-auto max-h-[600px] object-contain"
                                />
                                {!readOnly && (
                                    <button
                                        onClick={() => onChange('')}
                                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 opacity-0 group-hover/image:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => !readOnly && fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center 
                                    transition-all bg-gray-50/30
                                    ${!readOnly ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => onImageUpload(e.target.files[0])}
                                    disabled={readOnly}
                                />
                                {block.metadata?.uploading ? (
                                    <div className="flex flex-col items-center text-blue-500">
                                        <Loader className="animate-spin mb-2" size={32} />
                                        <span className="text-sm font-medium">Subiendo imagen...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <ImageIcon className="mx-auto mb-3" size={32} />
                                        <span className="text-sm font-medium">Click para subir una imagen</span>
                                        <span className="text-xs mt-1 text-gray-300">PNG, JPG, GIF up to 5MB</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-2 text-center">
                            <input
                                type="text"
                                value={block.metadata?.caption || ''}
                                onChange={e => onMetadataChange({ caption: e.target.value })}
                                placeholder="Escribe una leyenda (opcional)..."
                                className="text-center text-sm text-gray-500 bg-transparent outline-none placeholder:text-gray-300 w-full"
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                );

            default: // TEXT
                return (
                    <textarea
                        ref={textAreaRef}
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className={`${baseClasses} ${placeholderClasses} text-lg text-gray-700 leading-relaxed`}
                        placeholder="Escribe algo..."
                        readOnly={readOnly}
                        rows={1}
                    />
                );
        }
    };

    return (
        <div
            className="group relative flex items-start -ml-12 pl-12 py-1 rounded-lg transition-colors"
            draggable={!readOnly}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            {/* Left Controls */}
            {!readOnly && (
                <div className="absolute left-0 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onShowMenu}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                        title="Agregar bloque abajo"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        className="p-1 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
                        title="Arrastrar para mover"
                    >
                        <GripVertical size={18} />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Eliminar bloque"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {/* Block Content */}
            <div className="flex-1 min-w-0 px-2 border border-transparent rounded-lg hover:border-gray-100 transition-colors">
                {renderInput()}
            </div>

            {/* Block Type Menu */}
            {showMenu && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={onCloseMenu} />
                    <div className="absolute left-10 top-10 z-[70] bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Transformar en</div>
                        {BLOCK_MENU.map(({ type, icon: Icon, label }) => (
                            <button
                                key={type}
                                onClick={() => {
                                    onAddBlock(type);
                                    onCloseMenu();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                            >
                                <Icon size={16} className="text-gray-400" />
                                <span className="font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
