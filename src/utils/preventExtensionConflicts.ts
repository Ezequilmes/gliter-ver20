/**
 * Utility to prevent browser extension conflicts
 * Specifically handles issues with wallet extensions like MetaMask
 * that try to redefine window.ethereum
 */

export function preventExtensionConflicts() {
  if (typeof window === 'undefined') return;

  try {
    // Add error handling for extension conflicts
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Cannot redefine property: ethereum')) {
        console.warn('Extension conflict detected and handled:', event.message);
        event.preventDefault();
        return false;
      }
    });

    // Suppress specific evmAsk.js errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('evmAsk') || message.includes('Cannot redefine property: ethereum')) {
        console.warn('Extension conflict suppressed:', message);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Captura promesas no manejadas para suprimir errores de extensiones (MetaMask/ethereum)
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const msg = String(event.reason ?? '');
          if (
            msg.includes('Cannot redefine property: ethereum') ||
            msg.includes('MetaMask') ||
            msg.includes('ethereum') ||
            msg.includes('evmAsk')
          ) {
            console.warn('[Gliter] UnhandledRejection suprimido por conflicto de extensión:', msg);
            event.preventDefault();
            return false;
          }
        } catch (error) {
          // Silenciar errores de setup; no deben bloquear la app en producción
          console.warn('Error setting up extension conflict prevention:', error);
        }
        return undefined;
      }, { capture: true });
    }
  } catch (error) {
    console.warn('Error setting up extension conflict prevention:', error);
  }
}

// Auto-execute on import
if (typeof window !== 'undefined') {
  preventExtensionConflicts();
}