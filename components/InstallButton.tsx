'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Verificar se já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowButton(false);
      return;
    }

    // Escutar evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    });

    // Verificar se já foi fechado antes
    const bannerFechado = localStorage.getItem('pwa-banner-fechado');
    if (bannerFechado === 'true') {
      setShowBanner(false);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        console.log('✅ App instalado!');
        setShowButton(false);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const fecharBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-fechado', 'true');
  };

  if (!showButton && !showBanner) return null;

  // Banner que aparece no topo
  if (showBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-purple-700 text-white p-4 shadow-2xl z-50 md:flex md:justify-between md:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm">📱 Igreja Nova Jerusalém</p>
            <p className="text-xs opacity-90">Instale o app na tela inicial do seu celular</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <button
            onClick={handleInstall}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Instalar
          </button>
          <button
            onClick={fecharBanner}
            className="text-white/60 hover:text-white transition p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Botão flutuante (caso o banner seja fechado)
  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-purple-700 transition flex items-center gap-2 z-50 text-sm"
    >
      <Download className="w-5 h-5" />
      Instalar App
    </button>
  );
}