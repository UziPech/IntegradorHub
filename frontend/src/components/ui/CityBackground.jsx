import { Suspense, useEffect, useState, useRef, lazy } from 'react';
import { FloatingPhrases } from './FloatingPhrases';
import { usePerformance } from '../../hooks/usePerformance';

// ─── Lazy-load the entire 3D scene to avoid blocking the login form ────────
// This means React, React-Router, and the login UI render FIRST,
// then the Three.js bundle downloads in the background.
const Lazy3DScene = lazy(() => import('./CityScene'));

// ─── Componente exportado ──────────────────────────────────────────────────
export function CityBackground({ isDark = false, isRegister = false }) {
    const { performanceTier, isLowEnd } = usePerformance();
    const [showScene, setShowScene] = useState(false);

    // Delay mounting the 3D scene slightly so the login form paints first
    useEffect(() => {
        if (isLowEnd) return;
        const timer = requestAnimationFrame(() => {
            setShowScene(true);
        });
        return () => cancelAnimationFrame(timer);
    }, [isLowEnd]);

    return (
        <>
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            background: isDark
                ? 'linear-gradient(160deg, #020617 0%, #0a1628 45%, #0c1a3a 75%, #060c1a 100%)'
                : 'linear-gradient(160deg, #e8f0fe 0%, #dbeafe 40%, #eff6ff 75%, #f0f4ff 100%)',
            transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            {!isLowEnd && showScene && (
                <Suspense fallback={<SceneLoadingFallback isDark={isDark} />}>
                    <Lazy3DScene
                        isDark={isDark}
                        isRegister={isRegister}
                        performanceTier={performanceTier}
                    />
                </Suspense>
            )}

            {/* ── Gradiente inferior reforzado: oculta la base del edificio ── */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0,
                width: '100%',
                height: '40%',
                background: isDark
                    ? 'linear-gradient(to top, #020617 0%, rgba(6,12,26,0.92) 30%, rgba(10,22,40,0.65) 65%, transparent 100%)'
                    : 'linear-gradient(to top, #dbeafe 0%, rgba(219,234,254,0.95) 30%, rgba(224,238,254,0.6) 65%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── Gradiente superior: funde el cielo ── */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '20%',
                background: isDark
                    ? 'linear-gradient(to bottom, rgba(2,6,23,0.5) 0%, transparent 100%)'
                    : 'linear-gradient(to bottom, rgba(232,240,254,0.4) 0%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── Viñeta lateral para enfocar en el centro ── */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                background: isDark
                    ? 'radial-gradient(ellipse at 58% 42%, transparent 30%, rgba(2,6,23,0.5) 100%)'
                    : 'radial-gradient(ellipse at 58% 42%, transparent 30%, rgba(200,220,254,0.35) 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── Brillo de horizonte (línea de luz en la base oculta) ── */}
            <div style={{
                position: 'absolute',
                bottom: '38%',
                left: 0,
                width: '100%',
                height: '80px',
                background: isDark
                    ? 'linear-gradient(to top, transparent 0%, rgba(59,130,246,0.06) 50%, transparent 100%)'
                    : 'linear-gradient(to top, transparent 0%, rgba(147,197,253,0.08) 50%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── Destellos decorativos de luz (modo oscuro) ── */}
            {isDark && (
                <>
                    <div style={{
                        position: 'absolute',
                        top: '15%', left: '8%',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '20%', right: '10%',
                        width: '160px', height: '160px',
                        background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                    }} />
                </>
            )}

            {/* ── Destellos decorativos de luz (modo claro) ── */}
            {!isDark && (
                <>
                    <div style={{
                        position: 'absolute',
                        top: '10%', left: '5%',
                        width: '280px', height: '280px',
                        background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '30%', right: '5%',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, rgba(199,210,254,0.2) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                    }} />
                </>
            )}
        </div>
        
        {/* Mensajes flotantes estilo testimonio */}
        <FloatingPhrases isDark={isDark} />
        </>
    );
}

// ─── Fallback premium while 3D scene chunk loads ──────────────────────────
function SceneLoadingFallback({ isDark }) {
    return (
        <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            opacity: 0.6,
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: `2px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.1)'}`,
                borderTopColor: isDark ? '#3b82f6' : '#6b7280',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default CityBackground;
