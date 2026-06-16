'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Calendar, Clock, Users, Music, CheckCircle, XCircle,
  Plus, Edit, Trash2, ArrowLeft, Loader2, Palette, User, Mic, 
  Mic2, Guitar, Drum, Piano, Sparkles, Star, Eye
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

interface Escala {
  id: number;
  data_culto: string;
  tipo_culto: string;
  lider_nome: string;
  lider_id: number;
  ministro_id: number;
  ministro_nome: string;
  observacoes: string;
  status: string;
  ensaio_marcado: boolean;
  ensaio_horario: string;
  cor_paleta: string;
  membros: Array<{
    id: number;
    colaborador_id: number;
    nome: string;
    instrumento: string;
    confirmado: boolean;
    cor_paleta: string;
    back_vocal: boolean;
  }>;
  musicas: Array<{
    id: number;
    musica_id: number;
    titulo: string;
    artista: string;
    tom: string;
    cor_paleta: string;
  }>;
}

interface Musico {
  id: number;
  nome: string;
  email: string;
  instrumento: string;
  cor_paleta: string;
  nivel: string;
  funcao: string;
}

export default function EscalaLouvorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [isLider, setIsLider] = useState(false);
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    data_culto: '',
    tipo_culto: 'domingo_manha',
    ministro_id: '',
    observacoes: '',
    ensaio_marcado: false,
    ensaio_horario: '',
    cor_paleta: '#6B1D96',
    membrosSelecionados: [] as {id: number, instrumento: string, cor_paleta: string, back_vocal: boolean}[],
    musicasSelecionadas: [] as number[]
  });

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
      console.log('Dados do colaborador:', data);
      
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
      
      console.log('Escalas recebidas:', escalasData);
      console.log('Músicos recebidos:', musicosData);
      
      setEscalas(Array.isArray(escalasData) ? escalasData : []);
      
      const musicosComInstrumento = musicosData.map((m: any) => {
        let instrumento = 'Músico';
        if (m.email === '1@1.com') instrumento = 'Baterista';
        else if (m.nome?.toLowerCase().includes('vini')) instrumento = 'Baixista';
        else if (m.email === '12@12.com') instrumento = 'Líder/Vocal';
        else if (m.email === 'teste@gmail.com') instrumento = 'Tecladista';
        else if (m.email === 'test@123.com') instrumento = 'Guitarrista';
        else if (m.funcao) instrumento = m.funcao;
        return { ...m, instrumento: instrumento, cor_paleta: '#6B1D96' };
      });
      
      setMusicos(Array.isArray(musicosComInstrumento) ? musicosComInstrumento : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const confirmarPresenca = async (escalaId: number, colaboradorId: number, confirmado: boolean) => {
    try {
      const response = await fetch('/api/escala-musica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalaId, colaboradorId, confirmado })
      });
      
      if (response.ok) {
        toast.success(confirmado ? 'Presença confirmada!' : 'Presença cancelada');
        carregarDados();
      }
    } catch (error) {
      toast.error('Erro ao confirmar presença');
    }
  };

  const abrirEdicao = (escala: Escala) => {
    setEditandoId(escala.id);
    setForm({
      data_culto: escala.data_culto,
      tipo_culto: escala.tipo_culto,
      ministro_id: escala.ministro_id?.toString() || '',
      observacoes: escala.observacoes || '',
      ensaio_marcado: escala.ensaio_marcado || false,
      ensaio_horario: escala.ensaio_horario || '',
      cor_paleta: escala.cor_paleta || '#6B1D96',
      membrosSelecionados: escala.membros?.map(m => ({
        id: m.colaborador_id,
        instrumento: m.instrumento || 'Músico',
        cor_paleta: m.cor_paleta || '#6B1D96',
        back_vocal: m.back_vocal || false
      })) || [],
      musicasSelecionadas: escala.musicas?.map(m => m.musica_id) || []
    });
    setMostrarForm(true);
  };

  const excluirEscala = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;
    
    try {
      const response = await fetch(`/api/escala-musica?id=${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('Escala excluída com sucesso!');
        carregarDados();
      } else {
        toast.error('Erro ao excluir escala');
      }
    } catch (error) {
      toast.error('Erro ao excluir escala');
    }
  };

  const salvarEscala = async () => {
    if (!form.data_culto) {
      toast.error('Selecione a data do culto');
      return;
    }

    if (form.membrosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um músico');
      return;
    }

    if (!form.ministro_id) {
      toast.error('Selecione o ministro do evento');
      return;
    }

    try {
      const ministroSelecionado = musicos.find(m => m.id === parseInt(form.ministro_id));
      const payload = {
        data_culto: form.data_culto,
        tipo_culto: form.tipo_culto,
        ministro_id: parseInt(form.ministro_id),
        observacoes: form.observacoes,
        criado_por: session?.user?.id,
        lider_id: colaboradorId,
        ensaio_marcado: form.ensaio_marcado,
        ensaio_horario: form.ensaio_horario || null,
        cor_paleta: form.cor_paleta,
        membros: form.membrosSelecionados.map(m => ({ 
          id: m.id, 
          instrumento: m.instrumento || 'Músico',
          cor_paleta: m.cor_paleta || '#6B1D96',
          back_vocal: m.back_vocal || false
        })),
        musicas: form.musicasSelecionadas
      };
      
      const url = editandoId ? `/api/escala-musica?id=${editandoId}` : '/api/escala-musica';
      const method = editandoId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(editandoId ? 'Escala atualizada!' : 'Escala criada com sucesso!');
        setMostrarForm(false);
        setEditandoId(null);
        setForm({ 
          data_culto: '', 
          tipo_culto: 'domingo_manha', 
          ministro_id: '',
          observacoes: '', 
          ensaio_marcado: false,
          ensaio_horario: '',
          cor_paleta: '#6B1D96',
          membrosSelecionados: [], 
          musicasSelecionadas: [] 
        });
        carregarDados();
      } else {
        toast.error(result.error || 'Erro ao salvar escala');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar escala');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTipoCultoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'domingo_manha': 'Domingo - Manhã (09h)',
      'domingo_noite': 'Domingo - Noite (19h)',
      'quarta': 'Quarta-feira (19h30)',
      'sexta': 'Sexta-feira (19h30)'
    };
    return tipos[tipo] || tipo;
  };

  const getInstrumentoIcon = (instrumento: string) => {
    const iconMap: Record<string, any> = {
      'Baterista': Drum,
      'Guitarrista': Guitar,
      'Baixista': Guitar,
      'Tecladista': Piano,
      'Líder/Vocal': Mic,
      'Vocal': Mic,
      'Back Vocal': Mic
    };
    const Icon = iconMap[instrumento] || Mic;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/colaborador/louvor">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <Logo className="w-12 h-12 bg-white rounded-full p-1" />
              <div>
                <h1 className="text-2xl font-bold">Escala de Músicos</h1>
                <p className="opacity-90">Organize a equipe de louvor</p>
              </div>
            </div>
            {isLider && (
              <button
                onClick={() => {
                  setEditandoId(null);
                  setForm({ 
                    data_culto: '', 
                    tipo_culto: 'domingo_manha', 
                    ministro_id: '',
                    observacoes: '', 
                    ensaio_marcado: false,
                    ensaio_horario: '',
                    cor_paleta: '#6B1D96',
                    membrosSelecionados: [], 
                    musicasSelecionadas: [] 
                  });
                  setMostrarForm(true);
                }}
                className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" /> Nova Escala
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Formulário de Nova/Editar Escala */}
        {mostrarForm && isLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">{editandoId ? 'Editar Escala' : 'Nova Escala de Louvor'}</h2>
                <p className="text-sm text-gray-500">{editandoId ? 'Edite os dados da escala' : 'Preencha os dados para criar uma nova escala'}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data do Culto *</label>
                    <input
                      type="date"
                      value={form.data_culto}
                      onChange={(e) => setForm({...form, data_culto: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Culto</label>
                    <select
                      value={form.tipo_culto}
                      onChange={(e) => setForm({...form, tipo_culto: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="domingo_manha">Domingo - Manhã</option>
                      <option value="domingo_noite">Domingo - Noite</option>
                      <option value="quarta">Quarta-feira</option>
                      <option value="sexta">Sexta-feira</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ministro do Evento *</label>
                  <select
                    value={form.ministro_id}
                    onChange={(e) => setForm({...form, ministro_id: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Selecione o ministro</option>
                    {musicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} {m.nivel === 'lider' ? '⭐' : ''} - {m.instrumento || 'Músico'}
                      </option>
                    ))}
                  </select>
                  {form.ministro_id && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Ministro selecionado: {musicos.find(m => m.id === parseInt(form.ministro_id))?.nome}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Paleta de Cores</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.cor_paleta}
                        onChange={(e) => setForm({...form, cor_paleta: e.target.value})}
                        className="w-12 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-500">{form.cor_paleta}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ensaio</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.ensaio_marcado}
                          onChange={(e) => setForm({...form, ensaio_marcado: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Marcar Ensaio</span>
                      </label>
                      {form.ensaio_marcado && (
                        <input
                          type="time"
                          value={form.ensaio_horario}
                          onChange={(e) => setForm({...form, ensaio_horario: e.target.value})}
                          className="w-full border rounded-lg p-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({...form, observacoes: e.target.value})}
                    rows={2}
                    className="w-full border rounded-lg p-2"
                    placeholder="Ex: Ensaio às 18h, trazer instrumentos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Músicos na Escala</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {musicos.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum músico cadastrado</p>
                    ) : (
                      musicos.map((musico) => {
                        const isLiderMusico = musico.nivel === 'lider';
                        const jaSelecionado = form.membrosSelecionados.some(m => m.id === musico.id);
                        return (
                          <div key={musico.id} className={`p-2 rounded ${isLiderMusico ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'}`}>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={jaSelecionado}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setForm({
                                      ...form, 
                                      membrosSelecionados: [...form.membrosSelecionados, { 
                                        id: musico.id, 
                                        instrumento: musico.instrumento || 'Músico',
                                        cor_paleta: '#6B1D96',
                                        back_vocal: false
                                      }]
                                    });
                                  } else {
                                    setForm({
                                      ...form, 
                                      membrosSelecionados: form.membrosSelecionados.filter(m => m.id !== musico.id)
                                    });
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className={isLiderMusico ? 'font-bold text-yellow-700' : ''}>
                                {isLiderMusico ? '⭐ ' : ''}{musico.nome}
                              </span>
                              {getInstrumentoIcon(musico.instrumento)}
                              <span className="text-sm text-gray-500">({musico.instrumento || 'Músico'})</span>
                              {isLiderMusico && <span className="text-xs text-yellow-600 font-semibold">Líder</span>}
                            </label>
                            {jaSelecionado && (
                              <div className="ml-6 mt-1 flex items-center gap-4">
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={form.membrosSelecionados.find(m => m.id === musico.id)?.back_vocal || false}
                                    onChange={(e) => {
                                      const novos = form.membrosSelecionados.map(m => 
                                        m.id === musico.id ? {...m, back_vocal: e.target.checked} : m
                                      );
                                      setForm({...form, membrosSelecionados: novos});
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <Mic2 className="w-3 h-3" /> Back Vocal
                                </label>
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="color"
                                    value={form.membrosSelecionados.find(m => m.id === musico.id)?.cor_paleta || '#6B1D96'}
                                    onChange={(e) => {
                                      const novos = form.membrosSelecionados.map(m => 
                                        m.id === musico.id ? {...m, cor_paleta: e.target.value} : m
                                      );
                                      setForm({...form, membrosSelecionados: novos});
                                    }}
                                    className="w-5 h-5 border rounded"
                                  />
                                  <span className="text-xs text-gray-500">Cor</span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-2">
                <button onClick={salvarEscala} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                  {editandoId ? 'Atualizar Escala' : 'Criar Escala'}
                </button>
                <button onClick={() => {
                  setMostrarForm(false);
                  setEditandoId(null);
                }} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Escalas */}
        <div className="space-y-6">
          {escalas.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">Nenhuma escala criada</h3>
              <p className="text-gray-500">
                {isLider ? 'Clique em "Nova Escala" para começar' : 'Aguardando o líder criar uma escala'}
              </p>
            </div>
          ) : (
            escalas.map((escala) => {
              const isMembro = escala.membros?.some(m => m.colaborador_id === colaboradorId);
              const isMinistro = escala.ministro_id === colaboradorId;
              
              return (
                <div key={escala.id} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ borderLeft: `4px solid ${escala.cor_paleta || '#6B1D96'}` }}>
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{formatarData(escala.data_culto)}</h2>
                        <p className="text-gray-500">{getTipoCultoLabel(escala.tipo_culto)}</p>
                        {escala.ministro_nome && (
                          <p className="text-sm text-purple-600 mt-1">Ministro: {escala.ministro_nome}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                          Líder: {escala.lider_nome || 'Pastor'}
                        </span>
                        {escala.ensaio_marcado && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ensaio: {escala.ensaio_horario?.slice(0, 5)}h
                          </span>
                        )}
                        {isMembro && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Você está nessa escala
                          </span>
                        )}
                        {isMinistro && (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Star className="w-3 h-3" /> Você é o ministro
                          </span>
                        )}
                      </div>
                    </div>
                    {escala.observacoes && (
                      <p className="mt-2 text-sm text-gray-600">📝 {escala.observacoes}</p>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Músicos Escalados
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                      {escala.membros?.length > 0 ? (
                        escala.membros.map((membro) => (
                          <div key={membro.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg" style={{ borderLeft: `3px solid ${membro.cor_paleta || '#6B1D96'}` }}>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium" style={{ color: membro.cor_paleta || '#6B1D96' }}>
                                  {membro.nome}
                                  {membro.colaborador_id === colaboradorId && ' ⭐'}
                                </p>
                                {membro.back_vocal && (
                                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Mic2 className="w-3 h-3" /> Back Vocal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{membro.instrumento}</p>
                            </div>
                            {membro.confirmado ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Confirmado
                              </span>
                            ) : (
                              <button
                                onClick={() => confirmarPresenca(escala.id, membro.colaborador_id, true)}
                                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700"
                              >
                                Confirmar Presença
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm col-span-2">Nenhum músico escalado</p>
                      )}
                    </div>
                    
                    {escala.musicas && escala.musicas.length > 0 && (
                      <>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <Music className="w-5 h-5" />
                          Repertório
                        </h3>
                        <div className="space-y-2">
                          {escala.musicas.map((musica, index) => (
                            <div key={musica.id} className="flex justify-between items-center p-2 border-b" style={{ borderLeft: `3px solid ${musica.cor_paleta || escala.cor_paleta || '#6B1D96'}` }}>
                              <div className="pl-3">
                                <p className="font-medium">{index + 1}. {musica.titulo}</p>
                                <p className="text-sm text-gray-500">{musica.artista} - Tom: {musica.tom}</p>
                              </div>
                              <button className="text-purple-600 hover:text-purple-700 text-sm">Ver Cifra</button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {isLider && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <button 
                          onClick={() => abrirEdicao(escala)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" /> Editar
                        </button>
                        <button 
                          onClick={() => excluirEscala(escala.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                      </div>
                    )}

                    {isMinistro && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Link href={`/colaborador/louvor/escala/${escala.id}`} className="flex-1">
                          <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" /> Personalizar Culto
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}