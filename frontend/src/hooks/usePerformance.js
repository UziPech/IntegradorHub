import { useMemo } from 'react';

/**
 * Hook para detectar las capacidades de rendimiento del dispositivo.
 * Proporciona una forma de adaptar la carga visual (especialmente 3D) 
 * para asegurar una experiencia fluida.
 * 
 * Retorna:
 * - performanceTier: 'low' | 'medium' | 'high'
 * - isLowEnd: boolean (True si el dispositivo es gama baja/antiguo)
 */
export function usePerformance() {
    return useMemo(() => {
        // En navegadores que no soportan estas APIs (Safari/Firefox),
        // tomamos valores conservadores.
        const memory = navigator.deviceMemory || 8; 
        const cores = navigator.hardwareConcurrency || 4;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);

        // 1. GAMA BAJA (LOW): Dispositivos que probablemente sufran con el 3D.
        // Criterio: Menos de 4GB de RAM o menos de 4 núcleos de CPU.
        if (memory < 4 || cores < 4) {
            return { performanceTier: 'low', isLowEnd: true };
        }

        // 2. GAMA MEDIA (MEDIUM): Móviles modernos o equipos con recursos limitados.
        // Criterio: Es móvil (por GPU) o tiene entre 4GB-8GB RAM / 4-8 núcleos.
        if (isMobile || memory < 8 || cores < 8) {
            return { performanceTier: 'medium', isLowEnd: false };
        }

        // 3. GAMA ALTA (HIGH): Laptops potentes y Desktops.
        return { performanceTier: 'high', isLowEnd: false };
    }, []);
}

export default usePerformance;
