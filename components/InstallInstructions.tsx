'use client';
import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function InstallInstructions() {
  const [show, setShow] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);
    
    // Mostrar instruções se não estiver instalado
    if (!installed) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isInstalled || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">📱 Instalar App</h2>
          <button onClick={() => setShow(false)} className="text-gray-500 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Instale o app da Igreja Nova Jerusalém na tela inicial do seu celular para acesso rápido!
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <p className="text-sm text-gray-700">Abra o Chrome e acesse o site</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <p className="text-sm text-gray-700">Clique nos 3 pontinhos (⋮) no canto superior</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <p className="text-sm text-gray-700">Selecione <strong>"Adicionar à tela inicial"</strong></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <p className="text-sm text-gray-700">Clique em <strong>"Adicionar"</strong></p>
            </div>
          </div>
          
          <button
            onClick={() => setShow(false)}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Entendi, obrigado!
          </button>
        </div>
      </div>
    </div>
  );
}