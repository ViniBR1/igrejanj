'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Configuracao {
  nome_igreja: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  whatsapp: string;
  latitude: string;
  longitude: string;
  horarios: string;
  acessibilidade: string;
}

export default function LocalizacaoPage() {
  const [config, setConfig] = useState<Configuracao>({
    nome_igreja: 'Igreja Nova Jerusalém',
    endereco: 'Av. Abílio Augusto Távora',
    numero: '532',
    complemento: 'Cabuçu',
    bairro: 'Cabuçu',
    cidade: 'Nova Iguaçu',
    estado: 'RJ',
    cep: '26291-200',
    telefone: '(21) 98534-5627',
    email: 'contato@igrejanovajerusalem.com',
    whatsapp: '5521985345627',
    latitude: '-22.7592',
    longitude: '-43.4511',
    horarios: 'Terças 9h | Quartas 20h | Domingos 18h',
    acessibilidade: 'Entrada e estacionamento acessíveis para cadeirantes'
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch('/api/configuracoes/publicas');
      const data = await response.json();
      if (data) {
        setConfig({ ...config, ...data });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarEndereco = () => {
    const enderecoCompleto = `${config.endereco}, ${config.numero}${config.complemento ? ', ' + config.complemento : ''} - ${config.bairro}, ${config.cidade} - ${config.estado}, ${config.cep}`;
    navigator.clipboard.writeText(enderecoCompleto);
    setCopied(true);
    toast.success('Endereço copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const abrirGoogleMaps = () => {
    const endereco = `${config.endereco}, ${config.numero} - ${config.cidade}, ${config.estado}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
  };

  const abrirWaze = () => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(`${config.endereco}, ${config.numero} - ${config.cidade}`)}`, '_blank');
  };

  const abrirWhatsApp = () => {
    window.open(`https://wa.me/${config.whatsapp}`, '_blank');
  };

  const compartilhar = () => {
    const url = window.location.href;
    const texto = `📍 ${config.nome_igreja}\n\n${config.endereco}, ${config.numero} - ${config.bairro}\n${config.cidade} - ${config.estado}\n\n🕐 Horários:\n${config.horarios}\n\nVenha nos visitar! 🙏`;

    if (navigator.share) {
      navigator.share({
        title: config.nome_igreja,
        text: texto,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${texto}\n\nLink: ${url}`);
      toast.success('Link copiado para compartilhar!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                ← Voltar
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Localização</h1>
              <p className="opacity-90">Encontre nossa igreja</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mapa */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="relative h-96 w-full">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${config.latitude},${config.longitude}&zoom=16`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa da Igreja"
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📍 {config.nome_igreja}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            {/* Endereço */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📍 Endereço
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold text-lg">Templo Principal</p>
                <p>
                  {config.endereco}, {config.numero}
                  {config.complemento && `, ${config.complemento}`}
                </p>
                <p>{config.bairro}</p>
                <p>{config.cidade} - {config.estado}</p>
                <p>CEP: {config.cep}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={copiarEndereco}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar Endereço'}
                  </button>
                  <button
                    onClick={abrirGoogleMaps}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition"
                  >
                    🗺️ Google Maps
                  </button>
                  <button
                    onClick={abrirWaze}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    🚗 Waze
                  </button>
                </div>
              </div>
            </div>

            {/* Horários */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🕐 Horários dos Cultos
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center border-b border-gray-100 py-2">
                  <span className="font-medium">Terças-feiras</span>
                  <span>🕐 09:00</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 py-2">
                  <span className="font-medium">Quartas-feiras</span>
                  <span>🕐 20:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Domingos</span>
                  <span>🕐 18:00</span>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 flex items-center gap-2">
                    🕐 Venha nos visitar em qualquer um desses horários!
                  </p>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📞 Contato
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <span>📞</span>
                  <a href={`tel:${config.telefone}`} className="hover:text-purple-600 transition">
                    {config.telefone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span>📱</span>
                  <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition">
                    WhatsApp
                  </a>
                </div>
                <button
                  onClick={abrirWhatsApp}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  💬 Falar no WhatsApp
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  💡 A secretaria está disponível para atendimento
                </p>
              </div>
            </div>

            {/* Acessibilidade */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                ♿ Acessibilidade
              </h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    ♿
                  </div>
                  <div>
                    <p className="text-gray-700">✅ Entrada acessível para cadeirantes</p>
                    <p className="text-gray-700">✅ Estacionamento acessível</p>
                    <p className="text-sm text-gray-500 mt-1">
                      A igreja conta com estrutura adaptada para pessoas com mobilidade reduzida
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compartilhar */}
            <button
              onClick={compartilhar}
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition shadow-sm"
            >
              📤 Compartilhar Localização
            </button>
          </div>
        </div>

        {/* Versículo */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 text-center border border-purple-100">
          <p className="text-purple-800 text-sm italic">
            "E conhecereis a verdade, e a verdade vos libertará." 
            <br className="hidden sm:inline" />
            <span className="text-purple-600 font-semibold">- João 8:32</span>
          </p>
        </div>
      </div>
    </div>
  );
}