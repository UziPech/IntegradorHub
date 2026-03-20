import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Stars, PerspectiveCamera, Float } from '@react-three/drei';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Configure DRACO decoder for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
dracoLoader.preload();

// ─── Responsive config (valores calibrados con el modelo 4K) ───────────────
function getConfig(width) {
    if (width <= 640) {
        return { posX: 0, posY: -1.8, posZ: -0.3, rotX: 0, baseRotY: -1.4, rotZ: 0, scale: 9, cameraZ: 11, cameraY: 1.2 };
    }
    if (width <= 1024) {
        return { posX: 0, posY: -1.8, posZ: -0.3, rotX: 0, baseRotY: -1.4, rotZ: 0, scale: 12, cameraZ: 10, cameraY: 1.2 };
    }
    return { posX: 0, posY: -1.8, posZ: -0.3, rotX: 0, baseRotY: -1.4, rotZ: 0, scale: 14.3, cameraZ: 9.0, cameraY: 1.5 };
}

function useResponsiveConfig() {
    const [config, setConfig] = useState(() => getConfig(window.innerWidth));
    useEffect(() => {
        const onResize = () => setConfig(getConfig(window.innerWidth));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return config;
}

// ─── Niebla atmosférica que oculta la base ─────────────────────────────────
function SceneFog({ isDark }) {
    const fogColor = isDark ? '#020617' : '#dbeafe';
    return <fog attach="fog" args={[fogColor, 8, 22]} />;
}

// ─── Partículas flotantes (polvo de ciudad) ────────────────────────────────
function FloatingParticles({ isDark, count = 120 }) {
    const points = useRef();

    const [positions] = useState(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3]     = (Math.random() - 0.5) * 20;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return arr;
    });

    useFrame((state) => {
        if (!points.current) return;
        points.current.rotation.y = state.clock.elapsedTime * 0.02;
    });

    const color = isDark ? '#60a5fa' : '#93c5fd';

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={count}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.045}
                color={color}
                transparent
                opacity={isDark ? 0.6 : 0.35}
                sizeAttenuation
            />
        </points>
    );
}

// ─── Plano reflectante de suelo (efecto piso mojado) ────────────────────────
function ReflectiveGround({ isDark }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial
                color={isDark ? '#030712' : '#c7d5f0'}
                metalness={0.3}
                roughness={0.7}
                transparent
                opacity={0.0}
            />
        </mesh>
    );
}

// ─── Modelo 3D con Animación de paneo ──────────────────────────────────────
function Model({ config, isRegister }) {
    const { scene } = useGLTF('/models/modern_office_building_4k.glb', true, true, (loader) => {
        loader.setDRACOLoader(dracoLoader);
    });
    const groupRef = useRef();

    const loginRotY   = config.baseRotY - 0.5;
    const loginPosY   = config.posY;
    const loginRotX   = config.rotX;

    const registerRotY = config.baseRotY + 0.6;
    const registerPosY = config.posY - 4.2;
    const registerRotX = config.rotX + 0.08;

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const targetRotY = isRegister ? registerRotY : loginRotY;
        const targetPosY = isRegister ? registerPosY : loginPosY;
        const targetRotX = isRegister ? registerRotX : loginRotX;

        groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 3, delta);
        groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 3, delta);
        groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetPosY, 3, delta);
    });

    return (
        <group
            ref={groupRef}
            position={[config.posX, loginPosY, config.posZ]}
            rotation={[loginRotX, loginRotY, config.rotZ]}
        >
            <primitive object={scene} scale={config.scale} />
        </group>
    );
}

useGLTF.preload('/models/modern_office_building_4k.glb', true, true, (loader) => {
    loader.setDRACOLoader(dracoLoader);
});

// ─── Escena con iluminación cinematográfica ────────────────────────────────
function Scene({ isDark, config, isRegister, performanceTier }) {
    const isMedium = performanceTier === 'medium';

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, config.cameraY, config.cameraZ]} fov={42} />

            <SceneFog isDark={isDark} />

            {/* Luz ambiente base */}
            <ambientLight intensity={isDark ? 0.3 : 0.75} />

            {/* Luz principal direccional */}
            <directionalLight
                position={[8, 15, 12]}
                intensity={isDark ? 1.1 : 2.0}
                color={isDark ? '#e2e8f0' : '#ffffff'}
                castShadow={!isMedium}
                shadow-mapSize={isMedium ? [512, 512] : [2048, 2048]}
            />

            {/* Luz de relleno lateral izquierda */}
            <pointLight
                position={[-12, 6, 8]}
                intensity={isDark ? 1.0 : 1.4}
                color={isDark ? '#3b82f6' : '#e0eaff'}
                distance={55}
            />

            {/* Resplandor inferior */}
            <pointLight
                position={[0, -1, 6]}
                intensity={isDark ? 1.4 : 0.5}
                color={isDark ? '#60a5fa' : '#bfdbfe'}
                distance={28}
            />

            {/* Foco superior premium */}
            <spotLight
                position={[-4, 28, -2]}
                angle={0.35}
                penumbra={0.7}
                intensity={isDark ? 1.2 : 1.0}
                color={isDark ? '#818cf8' : '#dbeafe'}
                castShadow
            />

            {/* Luz de acento cálida — sólo en dark (neón urbano) */}
            {isDark && (
                <pointLight
                    position={[5, 0, 8]}
                    intensity={1.0}
                    color="#f59e0b"
                    distance={18}
                />
            )}

            {/* Luz de acento azul trasera para profundidad */}
            <pointLight
                position={[-2, 10, -8]}
                intensity={isDark ? 0.6 : 0.3}
                color={isDark ? '#1d4ed8' : '#93c5fd'}
                distance={40}
            />

            {/* Partículas flotantes */}
            <FloatingParticles isDark={isDark} count={isMedium ? 40 : 100} />

            {/* Plano de suelo */}
            <ReflectiveGround isDark={isDark} />

            {/* Estrellas solo en dark */}
            {isDark && (
                <Stars
                    radius={140}
                    depth={60}
                    count={isMedium ? 2000 : 7000}
                    factor={5}
                    saturation={0.3}
                    fade
                    speed={0.4}
                />
            )}

            <Suspense fallback={null}>
                <Model config={config} isRegister={isRegister} />
            </Suspense>

            <Environment preset={isDark ? 'night' : 'city'} />
        </>
    );
}

// ─── Loader premium mientras carga el GLB ────────────────────────────────
function Loader() {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh>
                <icosahedronGeometry args={[0.5, 2]} />
                <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
            </mesh>
            <mesh scale={0.8}>
                <icosahedronGeometry args={[0.5, 1]} />
                <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.3} />
            </mesh>
        </Float>
    );
}

// ─── Default export for lazy loading ──────────────────────────────────────
export default function CityScene({ isDark, isRegister, performanceTier }) {
    const config = useResponsiveConfig();

    return (
        <Canvas
            shadows={performanceTier === 'high'}
            dpr={performanceTier === 'high' ? [1, 2] : 1}
            style={{ pointerEvents: 'none' }}
        >
            <Suspense fallback={<Loader />}>
                <Scene
                    isDark={isDark}
                    config={config}
                    isRegister={isRegister}
                    performanceTier={performanceTier}
                />
            </Suspense>
        </Canvas>
    );
}
