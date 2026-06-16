'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Loader2, User, Mail, Phone, Calendar, Heart, Music, 
  Users, Plus, CheckCircle, Clock, XCircle, Mic, 
  Guitar, Drum, Piano, Sparkles, LogOut, Star, Eye
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import toast from 'react-hot-toast';

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

export default function ColaboradorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [colaborador, setColaborador] = useState<any>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [escalasMinistro, setEscalasMinistro] = useState<Escala[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.email) {
      carregarDados();
    }
  }, [status, session]);

  const carregarDados = async () => {
    try {
      const email = session?.user?.email;
      
      const colabRes = await fetch(`/api/colaboradores/buscar-simples?email=${email}`);
      const colabData = await colabRes.json();
      
      if (colabData && !colabData.error) {
        setColaborador(colabData);
        
        const escalasRes = await fetch(`/api/escala-musica?colaboradorId=${colabData.id}`);
        const escalasData = await escalasRes.json();
        setEscalas(Array.isArray(escalasData) ? escalasData : []);
        
        const escalasMinistroRes = await fetch(`/api/escala-musica?todas=true`);
        const todasEscalas = await escalasMinistroRes.json();
        const escalasMinistroData = todasEscalas.filter((e: any) => e.ministro_id === colabData.id);
        setEscalasMinistro(escalasMinistroData);
      } else {
        toast.error('Você não está vinculado a nenhuma área');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const confirmarPresenca = async (escalaId: number, confirmado: boolean) => {
    try {
      const response = await fetch('/api/escala-musica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escalaId, 
          colaboradorId: colaborador?.id,
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
    return <Icon className="w-5 h-5" />;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Acesso não autorizado</h1>
          <p className="text-gray-500">Você não está vinculado a nenhuma área.</p>
          <button onClick={() => router.push('/login')} className="mt-4 bg-black text-white px-6 py-2 rounded-lg">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const isLider = colaborador.nivel === 'lider';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${isLider ? 'from-purple-700 via-purple-600 to-purple-800' : 'from-blue-700 via-blue-600 to-blue-800'} text-white`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Logo className="w-14 h-14 bg-white rounded-full p-2 shadow-lg" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{colaborador.area_nome}</h1>
                <p className="opacity-90 text-sm md:text-base">Bem-vindo, {session?.user?.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm flex items-center gap-1">
                    {getInstrumentoIcon(colaborador.instrumento || colaborador.funcao || 'Músico')}
                    {colaborador.instrumento || colaborador.funcao || 'Músico'}
                  </span>
                  <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm">
                    {isLider ? '🎯 Líder' : '👤 Membro'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Próximas Escalas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {escalas.filter(e => 
                    e.membros?.some(m => m.colaborador_id === colaborador.id && !m.confirmado) ||
                    e.ministro_id === colaborador.id
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Presenças Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {escalas.filter(e => 
                    e.membros?.some(m => m.colaborador_id === colaborador.id && m.confirmado)
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Como Ministro</p>
                <p className="text-2xl font-bold text-yellow-600">{escalasMinistro.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna 1: Informações Pessoais */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Meus Dados
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{colaborador.nome}</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{colaborador.email}</span>
              </div>
              {colaborador.telefone && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{colaborador.telefone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                {getInstrumentoIcon(colaborador.instrumento || colaborador.funcao || 'Músico')}
                <span className="text-gray-700">Instrumento: <strong>{colaborador.instrumento || colaborador.funcao || 'Músico'}</strong></span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Ações */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Ações Rápidas
            </h2>
            <div className="space-y-3">
              <Link href="/colaborador/disponibilidade">
                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition border border-gray-200">
                  <Calendar className="w-4 h-4" />
                  Minha Disponibilidade
                </button>
              </Link>
              
              {colaborador.area_nome === 'Louvor' && (
                <Link href="/colaborador/louvor">
                  <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition border border-purple-200">
                    <Music className="w-4 h-4" />
                    Ministério de Louvor
                  </button>
                </Link>
              )}

              {isLider && (
                <Link href="/colaborador/louvor/escala">
                  <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition border border-green-200">
                    <Plus className="w-4 h-4" />
                    Criar Nova Escala
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Coluna 3: Resumo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Resumo
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 border-b border-gray-100">
                <span className="text-gray-500">Área</span>
                <span className="font-medium">{colaborador.area_nome}</span>
              </div>
              <div className="flex justify-between items-center p-2 border-b border-gray-100">
                <span className="text-gray-500">Nível</span>
                <span className="font-medium">{isLider ? '🎯 Líder' : '👤 Membro'}</span>
              </div>
              <div className="flex justify-between items-center p-2 border-b border-gray-100">
                <span className="text-gray-500">Instrumento</span>
                <span className="font-medium">{colaborador.instrumento || colaborador.funcao || 'Músico'}</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-500">Escalas</span>
                <span className="font-medium">{escalas.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escalas como Ministro */}
        {escalasMinistro.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Escalas como Ministro
              </h2>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Você pode personalizar o culto
              </span>
            </div>
            <div className="space-y-4">
              {escalasMinistro.map((escala) => (
                <div 
                  key={escala.id} 
                  className="border rounded-xl overflow-hidden hover:shadow-md transition"
                  style={{ borderColor: escala.cor_paleta || '#6B1D96' }}
                >
                  <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {formatarData(escala.data_culto)}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {getTipoCultoLabel(escala.tipo_culto)}
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Ministro
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{escala.membros?.length || 0} músicos</span>
                      </div>
                    </div>
                    <Link href={`/colaborador/louvor/escala/${escala.id}`}>
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center gap-1 shadow-sm">
                        <Eye className="w-4 h-4" /> Personalizar Culto
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minhas Escalas (como músico) */}
        {escalas.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Minhas Escalas (como músico)
            </h2>
            
            <div className="space-y-4">
              {escalas.map((escala) => {
                const meuMembro = escala.membros?.find(m => m.colaborador_id === colaborador.id);
                const estaConfirmado = meuMembro?.confirmado || false;
                const meuInstrumento = meuMembro?.instrumento || colaborador.instrumento || colaborador.funcao || 'Músico';
                const isMinistro = escala.ministro_id === colaborador.id;
                
                return (
                  <div 
                    key={escala.id} 
                    className="border rounded-xl overflow-hidden hover:shadow-md transition"
                    style={{ borderColor: escala.cor_paleta || '#6B1D96' }}
                  >
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-lg">
                            {formatarData(escala.data_culto)}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {getTipoCultoLabel(escala.tipo_culto)}
                          </span>
                          {isMinistro && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Ministro
                            </span>
                          )}
                          {escala.ensaio_marcado && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Ensaio {escala.ensaio_horario?.slice(0, 5)}h
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>Líder: {escala.lider_nome || 'Pastor'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Music className="w-4 h-4" />
                            <span>{escala.musicas?.length || 0} músicas</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <div className="bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            {getInstrumentoIcon(meuInstrumento)}
                            <span className="text-sm font-medium text-purple-700">{meuInstrumento}</span>
                          </div>
                          {meuMembro?.back_vocal && (
                            <span className="bg-pink-50 text-pink-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Mic className="w-3 h-3" /> Back Vocal
                            </span>
                          )}
                        </div>

                        {escala.observacoes && (
                          <p className="text-sm text-gray-500 mt-2">📝 {escala.observacoes}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        {estaConfirmado ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Confirmado
                            </span>
                            <button
                              onClick={() => confirmarPresenca(escala.id, false)}
                              className="text-red-500 text-xs hover:text-red-700 transition"
                            >
                              Cancelar presença
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmarPresenca(escala.id, true)}
                            className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm"
                          >
                            Confirmar Presença
                          </button>
                        )}
                        
                        {isMinistro && (
                          <Link href={`/colaborador/louvor/escala/${escala.id}`}>
                            <button className="mt-1 text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Personalizar Culto
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isLider && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 text-center">
            <p className="text-purple-700 font-semibold">🎯 Você é líder do ministério de {colaborador.area_nome}</p>
            <p className="text-sm text-purple-600 mt-1">Você pode criar, editar e excluir escalas</p>
            <Link href="/colaborador/louvor/escala">
              <button className="mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                Gerenciar Escalas
              </button>
            </Link>
          </div>
        )}

        {/* Versículo Motivacional */}
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200">
          <p className="text-gray-600 text-sm italic">
            "Servi ao Senhor com alegria. Apresentai-vos diante dele com cântico." - Salmos 100:2
          </p>
        </div>
      </div>
    </div>
  );
}