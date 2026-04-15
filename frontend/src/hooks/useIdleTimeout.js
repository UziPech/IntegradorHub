import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook para detectar inactividad del usuario en la ventana.
 * 
 * @param {Object} props
 * @param {boolean} props.enabled - Indica si el monitor de inactividad debe estar activo.
 * @param {number} props.timeoutMin - Cantidad de minutos tras los cuales se considera inactivo (default 30).
 * @param {Function} props.onTimeout - Función a ejecutar cuando expira el tiempo.
 * @param {Function} props.onPreTimeout - Función a ejecutar un tiempo antes de que expire (opcional).
 * @param {number} props.preTimeoutMin - Cantidad de minutos antes del timeout para ejecutar onPreTimeout (default 5).
 */
export function useIdleTimeout({ 
  enabled = true, 
  timeoutMin = 30, 
  onTimeout, 
  onPreTimeout = null,
  preTimeoutMin = 5 
}) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef(null);
  const preTimeoutIdRef = useRef(null);
  
  const timeoutMs = timeoutMin * 60 * 1000;
  const preTimeoutMs = (timeoutMin - preTimeoutMin) * 60 * 1000;

  const resetTimer = () => {
    if (!enabled) return;

    if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
    }
    if (preTimeoutIdRef.current) {
        clearTimeout(preTimeoutIdRef.current);
    }
    
    if (isIdle) {
      setIsIdle(false);
    }

    if (onPreTimeout && timeoutMin > preTimeoutMin) {
      preTimeoutIdRef.current = setTimeout(() => {
        onPreTimeout();
      }, preTimeoutMs);
    }

    timeoutIdRef.current = setTimeout(() => {
      setIsIdle(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);
  };

  useEffect(() => {
    if (!enabled) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (preTimeoutIdRef.current) clearTimeout(preTimeoutIdRef.current);
      return;
    }

    // Eventos que indican actividad manual del usuario en el navegador
    const events = [
      'mousemove',
      'mousedown',
      'click',
      'scroll',
      'keypress',
      'keydown',
      'touchstart'
    ];

    const handleEvent = () => resetTimer();

    // Inicializar el timer nada más montar
    resetTimer();

    events.forEach((event) => {
      document.addEventListener(event, handleEvent);
    });

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (preTimeoutIdRef.current) clearTimeout(preTimeoutIdRef.current);
      
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent);
      });
    };
  }, [enabled, timeoutMin, onTimeout, onPreTimeout, preTimeoutMin]);

  return { isIdle, resetTimer };
}
