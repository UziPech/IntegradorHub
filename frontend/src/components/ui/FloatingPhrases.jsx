import { useState, useEffect, useCallback } from 'react';

const TESTIMONIALS = [
    {
        text: "Construye soluciones robustas y fluidas. La arquitectura moderna nos permite iterar mucho más rápido en tu nuevo proyecto.",
        tags: "#buildinpublic #DSM",
        handle: "@innovador_utm",
        avatar: "Felix"
    },
    {
        text: "Crea experiencias digitales increíbles. Es fascinante cómo las tecnologías modernas simplifican el trabajo para desarrolladores.",
        tags: "#coding #Byfrost",
        handle: "@dev_student",
        avatar: "Aneka"
    },
    {
        text: "Innova sin preocuparte por la infraestructura subyacente. Compartir y evaluar proyectos nunca había sido tan ágil.",
        tags: "#tech #innovation",
        handle: "@tech_builder",
        avatar: "Zoey"
    },
    {
        text: "Diseña el mañana colaborando de manera eficiente. Todo el flujo de trabajo está integrado en una sola plataforma.",
        tags: "#software #design",
        handle: "@code_ninja",
        avatar: "Jack"
    },
    {
        text: "Colabora con otros estudiantes y lleva tus ideas al siguiente nivel utilizando herramientas de vanguardia.",
        tags: "#teamwork #community",
        handle: "@dsm_creator",
        avatar: "Oliver"
    }
];

/**
 * Crossfade A/B hook — two layers alternate so there's always visible text.
 * When the active layer fades out, the next layer with new content fades in
 * simultaneously.  No "blank gap" ever.
 */
function useCrossfade(intervalMs, getNextIndex) {
    // activeLayer: 'A' or 'B' — which layer is currently fully visible
    const [activeLayer, setActiveLayer] = useState('A');
    const [indexA, setIndexA] = useState(() => getNextIndex(-1));
    const [indexB, setIndexB] = useState(() => getNextIndex(getNextIndex(-1)));

    const swap = useCallback(() => {
        setActiveLayer(prev => {
            if (prev === 'A') {
                // B is about to become visible — prep B with new content first
                setIndexB(current => getNextIndex(current));
                return 'B';
            } else {
                // A is about to become visible — prep A with new content
                setIndexA(current => getNextIndex(current));
                return 'A';
            }
        });
    }, [getNextIndex]);

    useEffect(() => {
        const timer = setInterval(swap, intervalMs);
        return () => clearInterval(timer);
    }, [swap, intervalMs]);

    return {
        layerA: { index: indexA, isActive: activeLayer === 'A' },
        layerB: { index: indexB, isActive: activeLayer === 'B' },
    };
}

export function FloatingPhrases({ isDark }) {
    // Hide on tablets/mobile to prevent overlapping the login form
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Left side: cycles through even indices (0, 2, 4, 1, 3 ...)
    const getNextLeft = useCallback((current) => {
        if (current < 0) return 0;
        return (current + 2) % TESTIMONIALS.length;
    }, []);

    // Right side: cycles through odd indices (1, 3, 0, 2, 4 ...)
    const getNextRight = useCallback((current) => {
        if (current < 0) return 1;
        return (current + 2) % TESTIMONIALS.length;
    }, []);

    const left = useCrossfade(8000, getNextLeft);   // 8 seconds
    const right = useCrossfade(10000, getNextRight); // 10 seconds

    if (isMobile) return null;

    const textColor = isDark ? '#f9fafb' : '#111827';
    const quoteColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    const Card = ({ item, isActive, position }) => {
        const isLeft = position === 'left';

        return (
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
                pointerEvents: 'none',
                willChange: 'opacity, transform',
            }}>
                {/* Large Background Quote Mark */}
                <div style={{
                    fontSize: '140px',
                    fontFamily: 'serif',
                    color: quoteColor,
                    position: 'absolute',
                    top: '-60px',
                    left: '-30px',
                    zIndex: -1,
                    lineHeight: 1,
                    userSelect: 'none',
                    fontWeight: 700
                }}>
                    &ldquo;
                </div>

                {/* Main Phrase */}
                <p style={{
                    fontSize: '22px',
                    fontWeight: '500',
                    lineHeight: '1.45',
                    color: textColor,
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.02em',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    {item.text}
                </p>

                {/* Hashtags */}
                <p style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    color: textColor,
                    margin: '0 0 24px 0',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    {item.tags}
                </p>

                {/* User Info Row */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.avatar}`}
                            alt="avatar"
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <span style={{
                        marginLeft: '12px',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: textColor,
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        {item.handle}
                    </span>
                </div>
            </div>
        );
    };

    // Wrapper for a single side — contains the two crossfade layers
    const CrossfadeSlot = ({ layerA, layerB, position }) => {
        const isLeft = position === 'left';
        return (
            <div style={{
                position: 'absolute',
                top: isLeft ? '28%' : '42%',
                [isLeft ? 'left' : 'right']: '6%',
                width: '320px',
                zIndex: 5,
                pointerEvents: 'none',
            }}>
                <Card item={TESTIMONIALS[layerA.index]} isActive={layerA.isActive} position={position} />
                <Card item={TESTIMONIALS[layerB.index]} isActive={layerB.isActive} position={position} />
            </div>
        );
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 10
        }}>
            <CrossfadeSlot layerA={left.layerA} layerB={left.layerB} position="left" />
            <CrossfadeSlot layerA={right.layerA} layerB={right.layerB} position="right" />
        </div>
    );
}
