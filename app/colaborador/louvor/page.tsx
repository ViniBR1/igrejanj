'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Music, Calendar, Users, Plus, Edit, Trash2, 
  ArrowLeft, Loader2, Mic, Guitar, Drum, Piano,
  CheckCircle, Clock, Star, Heart, Sparkles, Eye
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

interface Escala {
  id: number;
  data_culto: string;
  tipo_culto: string;
  lider_nome: string;
  ministro_id: number;
  ministro_nome: string;
  observacoes: string;
  ensaio_marcado: boolean;
  ensaio_horario: string;
  cor_paleta: string;
  membros: Array<{
    id: number;
    colaborador_id: number;
    nome: string;
    instrumento: string;
    confirmado: boolean;
    back_vocal: boolean;
    cor_paleta: string;
  }>;
  musicas: Array<{
    titulo: string;
    artista: string;
    tom: string;
  }>;
}

interface Musico {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  instrumento: string;
  nivel: string;
}

export default function LouvorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLider, setIsLider] = useState(false);
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      carregarDados();
      verificarLider();
    }
  }, [status]);

  const verificarLider = async () => {
    try {
      const response = await fetch(`/api/colaboradores/buscar-simples?email=${session?.user?.email}`);
      const data = await response.json();
      
      if (data && !data.error) {
        setIsLider(data.nivel === 'lider');
        setColaboradorId(data.id);
      }
    } catch (error) {
      console.error('Erro ao verificar líder:', error);
    }
  };

  const carregarDados = async () => {
    try {
      const [escalasRes, musicosRes] = await Promise.all([
        fetch('/api/escala-musica?todas=true'),
        fetch('/api/colaboradores?areaId=2')
      ]);
      
      const escalasData = await escalasRes.json();
      const musicosData = await musicosRes.json();
      
      setEscalas(Array.isArray(escalasData) ? escalasData : []);
      
      const musicosComInstrumento = musicosData.map((m: any) => ({
        ...m,
        instrumento: m.funcao || 'Músico'
      }));
      
      setMusicos(Array.isArray(musicosComInstrumento) ? musicosComInstrumento : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const confirmarPresenca = async (escalaId: number, confirmado: boolean) => {
    if (!colaboradorId) {
      toast.error('Colaborador não identificado');
      return;
    }

    try {
      const response = await fetch('/api/escala-musica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escalaId, 
          colaboradorId: colaboradorId,
          confirmado 
        })
      });
      
      if (response.ok) {
        toast.success(confirmado ? '✅ Presença confirmada!' : '❌ Presença cancelada');
        carregarDados();
      }
    } catch (error) {
      toast.error('Erro ao confirmar presença');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTipoCultoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'domingo_manha': '🌅 Domingo - Manhã (09h)',
      'domingo_noite': '🌙 Domingo - Noite (19h)',
      'quarta': '📖 Quarta-feira (19h30)',
      'sexta': '🔥 Sexta-feira (19h30)'
    };
    return tipos[tipo] || tipo;
  };

  const getInstrumentoIcon = (instrumento: string) => {
    const iconMap: Record<string, any> = {
      'Baterista': Drum,
      'Bateria': Drum,
      'Guitarrista': Guitar,
      'Guitarra': Guitar,
      'Baixista': Guitar,
      'Baixo': Guitar,
      'Tecladista': Piano,
      'Teclado': Piano,
      'Vocal': Mic,
      'Líder/Vocal': Mic,
      'Back Vocal': Mic
    };
    const Icon = iconMap[instrumento] || Music;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  const minhasEscalas = escalas.filter(e => 
    e.membros?.some(m => m.colaborador_id === colaboradorId)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/colaborador">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <Logo className="w-14 h-14 bg-white rounded-full p-2 shadow-lg" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Ministério de Louvor</h1>
                <p className="opacity-90 text-sm">Organize a adoração da igreja</p>
                {isLider && (
                  <span className="inline-flex items-center gap-1 mt-1 bg-yellow-400 text-purple-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                    <Star className="w-3 h-3" /> Líder
                  </span>
                )}
              </div>
            </div>
            {isLider && (
              <Link href="/colaborador/louvor/escala">
                <button className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition font-medium shadow-lg">
                  <Plus className="w-5 h-5" />
                  Nova Escala
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Escalas</p>
                <p className="text-2xl font-bold text-purple-600">{escalas.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Músicos na Equipe</p>
                <p className="text-2xl font-bold text-blue-600">{musicos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Minhas Escalas</p>
                <p className="text-2xl font-bold text-green-600">{minhasEscalas.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Próximos Eventos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {escalas.filter(e => new Date(e.data_culto) >= new Date()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="/colaborador/louvor/escala">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition cursor-pointer hover:border-purple-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Escala de Músicos</h3>
                  <p className="text-sm text-gray-500">Ver e gerenciar escalas</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/colaborador/louvor/repertorio">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition cursor-pointer hover:border-purple-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Repertório</h3>
                  <p className="text-sm text-gray-500">Músicas e cifras</p>
                </div>
              </div>
            </div>
          </Link>

          {isLider && (
            <Link href="/colaborador/louvor/equipe">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition cursor-pointer hover:border-purple-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Equipe</h3>
                    <p className="text-sm text-gray-500">Gerenciar músicos</p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Minhas Escalas */}
        {minhasEscalas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Minhas Escalas
            </h2>
            <div className="space-y-3">
              {minhasEscalas.slice(0, 3).map((escala) => {
                const meuMembro = escala.membros?.find(m => m.colaborador_id === colaboradorId);
                const estaConfirmado = meuMembro?.confirmado || false;
                const meuInstrumento = meuMembro?.instrumento || 'Músico';

                return (
                  <div 
                    key={escala.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                    style={{ borderLeft: `4px solid ${escala.cor_paleta || '#6B1D96'}` }}
                  >
                    <div>
                      <p className="font-bold text-gray-800">{formatarData(escala.data_culto)}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{getTipoCultoLabel(escala.tipo_culto)}</span>
                        <span className="flex items-center gap-1">
                          {getInstrumentoIcon(meuInstrumento)}
                          {meuInstrumento}
                        </span>
                        {meuMembro?.back_vocal && (
                          <span className="text-pink-600 text-xs">🎤 Back Vocal</span>
                        )}
                      </div>
                    </div>
                    {estaConfirmado ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Confirmado
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmarPresenca(escala.id, true)}
                        className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition"
                      >
                        Confirmar Presença
                      </button>
                    )}
                  </div>
                );
              })}
              {minhasEscalas.length > 3 && (
                <Link href="/colaborador/louvor/escala">
                  <button className="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium py-2">
                    Ver todas as minhas escalas →
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Lista de Músicos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Equipe de Louvor
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {musicos.map((musico) => (
              <div 
                key={musico.id} 
                className={`p-3 rounded-xl border text-center transition ${
                  musico.nivel === 'lider' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {getInstrumentoIcon(musico.instrumento || musico.funcao || 'Músico')}
                </div>
                <p className="font-medium text-gray-800 text-sm truncate">{musico.nome}</p>
                <p className="text-xs text-gray-500 truncate">{musico.instrumento || musico.funcao || 'Músico'}</p>
                {musico.nivel === 'lider' && (
                  <span className="text-xs text-yellow-600 font-semibold">⭐ Líder</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Versículo */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 text-center border border-purple-100">
          <p className="text-purple-800 text-sm italic">
            "Entoarei louvores ao Senhor com todo o meu coração; contarei todas as tuas maravilhas." 
            <br className="hidden sm:inline" />
            <span className="text-purple-600 font-semibold">- Salmos 9:1</span>
          </p>
        </div>
      </div>
    </div>
  );
}