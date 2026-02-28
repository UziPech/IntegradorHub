import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Componente de una nube individual estilo caricatura mágica
function Cloud({ position, scale, speed, isDark }) {
    const groupRef = useRef();
    const initialX = position[0];
    const initialY = position[1];

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.x = initialX + Math.sin(state.clock.elapsedTime * speed) * 0.8;
            groupRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed * 0.7 + position[0]) * 0.15;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.015;
        }
    });

    const cloudParts = useMemo(() => {
        const s = scale;
        return [
            { pos: [0, 0, 0], size: 0.55 * s },
            { pos: [0.4 * s, 0.02, 0.05], size: 0.45 * s },
            { pos: [-0.4 * s, 0.02, 0.05], size: 0.43 * s },
            { pos: [0.12 * s, 0.3, 0.02], size: 0.4 * s },
            { pos: [-0.18 * s, 0.26, 0.02], size: 0.36 * s },
            { pos: [0.32 * s, 0.18, 0.03], size: 0.32 * s },
            { pos: [0.65 * s, -0.06, 0], size: 0.3 * s },
            { pos: [-0.58 * s, -0.04, 0], size: 0.28 * s },
            { pos: [0, 0.12, 0.1], size: 0.42 * s },
            { pos: [-0.08 * s, -0.08, 0.06], size: 0.36 * s },
        ];
    }, [scale]);

    return (
        <group ref={groupRef} position={position}>
            {cloudParts.map((part, i) => (
                <mesh key={i} position={part.pos}>
                    <sphereGeometry args={[part.size, 32, 32]} />
                    <meshBasicMaterial
                        color={isDark ? "#64748b" : "#ffffff"}
                        transparent
                        opacity={isDark ? 0.75 : 0.97}
                    />
                </mesh>
            ))}
            {cloudParts.slice(0, 5).map((part, i) => (
                <mesh key={`outline-${i}`} position={[part.pos[0], part.pos[1] - 0.03, part.pos[2] - 0.15]}>
                    <sphereGeometry args={[part.size * 1.04, 24, 24]} />
                    <meshBasicMaterial
                        color={isDark ? "#312e81" : "#c7d2fe"}
                        transparent
                        opacity={isDark ? 0.4 : 0.25}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Partículas mágicas de brillo
function MagicSparkles({ isDark }) {
    const particlesRef = useRef();
    const count = 45;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
            const material = particlesRef.current.material;
            material.opacity = (isDark ? 0.6 : 0.3) + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={isDark ? "#fbbf24" : "#d8b4fe"}
                size={0.06}
                transparent
                opacity={isDark ? 0.7 : 0.45}
                sizeAttenuation
            />
        </points>
    );
}

// Escena principal - Solo nubes y partículas (sin sol/luna, esos son SVG)
function Scene({ isDark }) {
    const clouds = useMemo(() => [
        { position: [-5, 2.5, -4], scale: 1.8, speed: 0.15 },
        { position: [5, 2, -5], scale: 1.2, speed: 0.2 },
        { position: [-2, -1.5, -3], scale: 0.9, speed: 0.25 },
        { position: [3, -0.5, -4], scale: 1.4, speed: 0.18 },
        { position: [0, 3, -6], scale: 2.2, speed: 0.12 },
        { position: [-6, 0.5, -5], scale: 1.1, speed: 0.22 },
        { position: [6, -2, -4], scale: 0.8, speed: 0.28 },
        { position: [-3.5, 1, -4.5], scale: 1.5, speed: 0.16 },
        { position: [2, -2.5, -5], scale: 1.0, speed: 0.24 },
    ], []);

    return (
        <>
            <ambientLight intensity={isDark ? 0.5 : 1.2} />
            {clouds.map((cloud, i) => (
                <Cloud key={i} {...cloud} isDark={isDark} />
            ))}
            <MagicSparkles isDark={isDark} />
        </>
    );
}

// ── Sol estilo cartoon, dibujado con SVG ──────────────────────────────────────
function SunSVG() {
    const bumpCount = 9;
    const cx = 100, cy = 100;
    // Each bump is a circle centered at bumpCenterR, with radius bumpR
    const bumpCenterR = 62;
    const bumpR = 26;
    const bumps = Array.from({ length: bumpCount }).map((_, i) => {
        const angle = (i / bumpCount) * 2 * Math.PI - Math.PI / 2;
        return {
            x: cx + Math.cos(angle) * bumpCenterR,
            y: cy + Math.sin(angle) * bumpCenterR,
        };
    });

    return (
        <div style={{
            position: 'absolute',
            top: '6%',
            right: '12%',
            width: '160px',
            height: '160px',
            filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.65)) drop-shadow(0 0 36px rgba(251,191,36,0.3))',
            pointerEvents: 'none',
        }}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    {/* Gradiente de la corona: dorado suave – armoniza con el fondo lavanda */}
                    <radialGradient id="sunCoronaGrad" cx="45%" cy="40%" r="60%" gradientUnits="userSpaceOnUse"
                        fx="80" fy="75">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="45%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                    {/* Gradiente esfera central: blanco-amarillo → amarillo brillante → dorado */}
                    <radialGradient id="sunCenterGrad" cx="37%" cy="30%" r="65%" gradientUnits="userSpaceOnUse"
                        fx="82" fy="72">
                        <stop offset="0%" stopColor="#fffde7" />
                        <stop offset="45%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </radialGradient>
                    {/* Brillo especular blanco */}
                    <radialGradient id="sunGloss" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse"
                        fx="82" fy="70">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                </defs>

                {/* ── Corona giratoria (solo los bumps + fill) ── */}
                <g style={{ transformOrigin: '100px 100px', animation: 'sunCoronaSpin 24s linear infinite' }}>
                    {/* Círculo de relleno central del corona (cubre la estrella interior) */}
                    <circle cx={cx} cy={cy} r={bumpCenterR} fill="url(#sunCoronaGrad)" />
                    {/* Bump circles – unión visual de círculos pequeños alrededor */}
                    {bumps.map((b, i) => (
                        <circle key={i} cx={b.x} cy={b.y} r={bumpR} fill="url(#sunCoronaGrad)" />
                    ))}
                </g>

                {/* ── Esfera central fija (no gira) ── */}
                <circle cx={cx} cy={cy} r={55} fill="url(#sunCenterGrad)" />
                {/* Brillo especular */}
                <ellipse cx={83} cy={76} rx={21} ry={15} fill="url(#sunGloss)" />
            </svg>
        </div>
    );
}


// ── Luna (media luna) + estrella, dibujados con SVG ──────────────────────────
function MoonSVG() {
    return (
        <div style={{
            position: 'absolute',
            top: '12%',
            right: '10%',
            width: '150px',
            height: '150px',
            filter: 'drop-shadow(0 0 18px rgba(165,138,255,0.55)) drop-shadow(0 0 35px rgba(165,138,255,0.25))',
            animation: 'moonFloat 4s ease-in-out infinite',
            pointerEvents: 'none',
        }}>
            <svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    {/* Luna: lila suave */}
                    <radialGradient id="moonGrad" cx="35%" cy="30%" r="65%">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="55%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </radialGradient>
                    {/* Brillo especular luna */}
                    <radialGradient id="moonShine" cx="35%" cy="30%" r="40%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    {/* Máscara para media luna */}
                    <mask id="crescentMask">
                        <rect width="220" height="200" fill="white" />
                        {/* Círculo que "corta" la parte derecha para hacer la media luna */}
                        <circle cx="118" cy="88" r="72" fill="black" />
                    </mask>
                    {/* Estrella: dorado */}
                    <radialGradient id="starGrad" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="55%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                </defs>

                {/* Media luna: círculo completo + máscara que lo corta */}
                <circle cx="88" cy="95" r="77" fill="url(#moonGrad)" mask="url(#crescentMask)" />
                {/* Brillo especular sobre la luna */}
                <ellipse cx="68" cy="68" rx="24" ry="17"
                    fill="url(#moonShine)"
                    mask="url(#crescentMask)" />

                {/* Estrella pequeña compañera */}
                <g transform="translate(168, 135) rotate(-15)">
                    <polygon
                        points="0,-18 4.5,-6 17,-6 7,3 11,16 0,8 -11,16 -7,3 -17,-6 -4.5,-6"
                        fill="url(#starGrad)"
                    />
                    {/* Brillo de la estrella */}
                    <ellipse cx="-4" cy="-6" rx="5" ry="3.5" fill="rgba(255,255,255,0.5)" />
                </g>
            </svg>
        </div>
    );
}

// Keyframes inyectados una sola vez
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes sunCoronaSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes moonFloat {
  0%, 100% { transform: translateY(0px) rotate(-5deg); }
  50%       { transform: translateY(-10px) rotate(-5deg); }
}
`;
if (!document.head.querySelector('[data-celestial-anim]')) {
    styleTag.setAttribute('data-celestial-anim', '');
    document.head.appendChild(styleTag);
}

// Componente exportable
export function CloudBackground({ isDark = false }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            background: isDark
                ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
                : 'linear-gradient(180deg, #c7d2fe 0%, #ddd6fe 20%, #e0e7ff 40%, #ede9fe 60%, #f5f3ff 80%, #faf5ff 100%)',
            pointerEvents: 'none',
            transition: 'background 0.5s ease'
        }}>
            {/* Sol o Luna como SVG absolutamente posicionados */}
            {isDark ? <MoonSVG /> : <SunSVG />}

            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <Scene isDark={isDark} />
            </Canvas>
        </div>
    );
}

export default CloudBackground;
