'use client';
import { useState, useEffect } from 'react';
import { 
  Play, Calendar, Clock, Users, Heart, 
  Share2, Copy, CheckCircle, ArrowLeft,
  Youtube, Instagram, Facebook, Link as LinkIcon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Transmissao {
  id: number;
  titulo: string;
  descricao: string;
  plataforma: string;
  link: string;
  data_transmissao: string;
  duracao: number;
  imagem_url: string;
  ativo: boolean;
}

export default function AoVivoPage() {
  const [transmissoes, setTransmissoes] = useState<Transmissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transmissao | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    carregarTransmissoes();
  }, []);

  const carregarTransmissoes = async () => {
    try {
      const response = await fetch('/api/transmissoes?ativo=true');
      const data = await response.json();
      setTransmissoes(data);
      if (data.length > 0) {
        setSelected(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar transmissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const getPlataformaIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      default: return <LinkIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatarData = (data: string) => {
    if (!data) return 'Data não definida';
    return new Date(data).toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
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
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Transmissão ao Vivo</h1>
              <p className="opacity-90">Assista nossos cultos online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Player Principal */}
        {selected && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className="relative aspect-video bg-black">
              {selected.link ? (
                <iframe
                  src={selected.link}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selected.titulo}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma transmissão no momento</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getPlataformaIcon(selected.plataforma)}
                    <h2 className="text-2xl font-bold text-gray-800">{selected.titulo}</h2>
                  </div>
                  <p className="text-gray-600">{selected.descricao}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {selected.data_transmissao && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatarData(selected.data_transmissao)}
                      </span>
                    )}
                    {selected.duracao && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selected.duracao} min
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copiarLink}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Compartilhar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Transmissões */}
        {transmissoes.length > 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Todas as Transmissões
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transmissoes.map((trans) => (
                <button
                  key={trans.id}
                  onClick={() => setSelected(trans)}
                  className={`text-left p-4 rounded-xl border transition ${
                    selected?.id === trans.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getPlataformaIcon(trans.plataforma)}
                    <h3 className="font-bold text-gray-800 line-clamp-1">{trans.titulo}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{trans.descricao}</p>
                  {trans.data_transmissao && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(trans.data_transmissao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {transmissoes.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Play className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nenhuma transmissão programada</h3>
            <p className="text-gray-500">Volte em breve para acompanhar nossas lives</p>
          </div>
        )}

        {/* Versículo */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 text-center border border-purple-100">
          <p className="text-purple-800 text-sm italic">
            "Porque onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles." 
            <br className="hidden sm:inline" />
            <span className="text-purple-600 font-semibold">- Mateus 18:20</span>
          </p>
        </div>
      </div>
    </div>
  );
}