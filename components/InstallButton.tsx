'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowButton(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
      console.log('✅ PWA pronto para instalação!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const bannerFechado = localStorage.getItem('pwa-banner-fechado');
    if (bannerFechado === 'true') {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('✅ App instalado!');
        setShowButton(false);
        setShowBanner(false);
        toast.success('✅ App instalado com sucesso!');
      } else {
        toast.info('Instalação cancelada');
      }
      setDeferredPrompt(null);
    } else {
      toast.info('📱 Clique nos 3 pontinhos → "Adicionar à tela inicial"');
      setShowBanner(true);
    }
  };

  const fecharBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-fechado', 'true');
  };

  // Banner preto
  if (showBanner && showButton) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 shadow-2xl z-50 md:flex md:justify-between md:items-center border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-full p-2">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">📱 Igreja Nova Jerusalém</p>
            <p className="text-xs opacity-80">Instale o app na tela inicial do seu celular</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <button
            onClick={handleInstall}
            className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Instalar
          </button>
          <button
            onClick={fecharBanner}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Botão flutuante preto
  if (showButton && !showBanner) {
    return (
      <button
        onClick={handleInstall}
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center gap-2 z-50 text-sm border border-gray-700"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>
    );
  }

  return null;
}