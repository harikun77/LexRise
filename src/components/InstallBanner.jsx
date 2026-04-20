import { useState, useEffect } from 'react';

// ── Detects if the app is already installed as a PWA ──────
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true; // iOS Safari
}

// ── InstallBanner ─────────────────────────────────────────
// Shows once per session when:
//   • The browser fires the 'beforeinstallprompt' event (Android/Chrome)
//   • OR on iOS where we can't detect but can show manual instructions
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  useEffect(() => {
    // Don't show if already installed or already dismissed this session
    if (isInstalled()) return;
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
                !window.MSStream;
    setIsIOS(ios);

    // Android / Chrome — browser provides the native install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS — show manual instructions after a short delay (3rd visit feel)
    if (ios) {
      const visits = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1;
      localStorage.setItem('pwa-visit-count', visits);
      // Show on 2nd+ visit so first-time users aren't immediately bombarded
      if (visits >= 2) setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-indigo-700/60 rounded-2xl p-4 shadow-2xl"
           style={{ boxShadow: '0 -4px 40px rgba(99,102,241,0.2)' }}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
            🏰
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">Add LexRise to your Home Screen</div>

            {isIOS ? (
              <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                Tap the <span className="text-white font-semibold">Share</span> button{' '}
                <span className="text-lg">⎙</span> then{' '}
                <span className="text-white font-semibold">"Add to Home Screen"</span>{' '}
                <span className="text-lg">➕</span> for the full app experience.
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-1">
                Install for offline access, full-screen mode, and faster loading.
              </div>
            )}

            {/* Benefits row */}
            <div className="flex gap-3 mt-2">
              {['⚡ Offline play', '📱 Full screen', '💾 Keeps progress'].map(b => (
                <span key={b} className="text-xs text-indigo-400">{b}</span>
              ))}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            className="text-gray-500 hover:text-gray-300 text-xl flex-shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Install button (Android only — iOS uses manual steps above) */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all btn-press"
          >
            ➕ Install App
          </button>
        )}
      </div>
    </div>
  );
}
