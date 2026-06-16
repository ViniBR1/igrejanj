'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, Music, Plus, Trash2, Edit, Save, 
  Loader2, Link as LinkIcon, Mic, 
  Palette, Guitar, Drum, Piano, Sparkles,
  Users, Calendar, Clock, CheckCircle, XCircle,
  Star, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

interface Musica {
  id: number;
  musica_id: number;
  titulo: string;
  artista: string;
  tom: string;
  cor_paleta: string;
  link: string;
  letra: string;
  cifra: string;
  ordem: number;
}

interface Membro {
  id: number;
  colaborador_id: number;
  nome: string;
  instrumento: string;
  confirmado: boolean;
  back_vocal: boolean;
  cor_paleta: string;
}

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
  membros: Membro[];
  musicas: Musica[];
}

export default function GerenciarEscalaPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [escala, setEscala] = useState<Escala | null>(null);
  const [isMinistro, setIsMinistro] = useState(false);
  const [mostrarModalMusica, setMostrarModalMusica] = useState(false);
  const [editandoMusica, setEditandoMusica] = useState<Musica | null>(null);
  const [formMusica, setFormMusica] = useState({
    titulo: '',
    artista: '',
    tom: 'C',
    cor_paleta: '#6B1D96',
    link: '',
    letra: '',
    cifra: ''
  });

  const tons = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      carregarDados();
    }
  }, [status]);

  const carregarDados = async () => {
    try {
      const response = await fetch(`/api/escala-musica?id=${params.id}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        router.push('/colaborador/louvor/escala');
        return;
      }
      
      console.log('Dados da escala:', data);
      setEscala(data);
      
      // Verificar se o usuário é o ministro
      const colabRes = await fetch(`/api/colaboradores/buscar-simples?email=${session?.user?.email}`);
      const colabData = await colabRes.json();
      
      if (colabData && colabData.id === data.ministro_id) {
        setIsMinistro(true);
        console.log('Usuário é o ministro!');
      } else {
        console.log('Usuário não é o ministro.');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar escala');
    } finally {
      setLoading(false);
    }
  };

  const adicionarMusica = async () => {
    if (!formMusica.titulo) {
      toast.error('Digite o título da música');
      return;
    }

    try {
      const response = await fetch('/api/musicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formMusica,
          criado_por: session?.user?.id
        })
      });

      if (response.ok) {
        const novaMusica = await response.json();
        console.log('Música criada:', novaMusica);
        
        const escalaResponse = await fetch(`/api/escala-musica/${params.id}/musicas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ musica_id: novaMusica.id })
        });

        if (escalaResponse.ok) {
          toast.success('Música adicionada!');
          setMostrarModalMusica(false);
          setFormMusica({ titulo: '', artista: '', tom: 'C', cor_paleta: '#6B1D96', link: '', letra: '', cifra: '' });
          carregarDados();
        } else {
          const error = await escalaResponse.json();
          toast.error(error.error || 'Erro ao adicionar à escala');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar música');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao adicionar música');
    }
  };

  const removerMusica = async (musicaId: number) => {
    if (!confirm('Remover esta música da escala?')) return;
    
    try {
      const response = await fetch(`/api/escala-musica/${params.id}/musicas?musicaId=${musicaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Música removida!');
        carregarDados();
      } else {
        toast.error('Erro ao remover música');
      }
    } catch (error) {
      toast.error('Erro ao remover música');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!escala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Escala não encontrada</h1>
          <Link href="/colaborador/louvor/escala">
            <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg">
              Voltar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/colaborador/louvor/escala">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <Logo className="w-12 h-12 bg-white rounded-full p-1" />
              <div>
                <h1 className="text-2xl font-bold">Personalizar Culto</h1>
                <p className="opacity-90">{formatarData(escala.data_culto)}</p>
                {isMinistro && (
                  <span className="text-sm bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full font-semibold inline-block mt-1">
                    🎤 Você é o ministro
                  </span>
                )}
              </div>
            </div>
            {isMinistro && (
              <button
                onClick={() => setMostrarModalMusica(true)}
                className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition shadow-lg"
              >
                <Plus className="w-5 h-5" /> Adicionar Música
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Informações da Escala */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-bold">{formatarData(escala.data_culto)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-bold">{escala.tipo_culto}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ministro</p>
              <p className="font-bold flex items-center gap-2">
                {escala.ministro_nome}
                {isMinistro && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Você</span>}
              </p>
            </div>
            {escala.ensaio_marcado && (
              <div>
                <p className="text-sm text-gray-500">Ensaio</p>
                <p className="font-bold">🕐 {escala.ensaio_horario?.slice(0, 5)}h</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Observações</p>
              <p className="text-gray-700">{escala.observacoes || 'Nenhuma observação'}</p>
            </div>
          </div>
        </div>

        {/* Equipe */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipe do Culto
          </h2>
          <div className="flex flex-wrap gap-2">
            {escala.membros?.length > 0 ? (
              escala.membros.map((membro) => (
                <span 
                  key={membro.id}
                  className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                  style={{ borderLeft: `3px solid ${membro.cor_paleta || '#6B1D96'}` }}
                >
                  {membro.nome} ({membro.instrumento})
                  {membro.back_vocal && ' 🎤'}
                  {membro.confirmado && ' ✅'}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Nenhum músico escalado</p>
            )}
          </div>
        </div>

        {/* Repertório - Área do Ministro */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Music className="w-5 h-5" />
              Repertório do Culto
            </h2>
            {isMinistro && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                🎯 Você pode personalizar
              </span>
            )}
          </div>
          
          {escala.musicas?.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {isMinistro 
                  ? 'Comece a personalizar o culto adicionando músicas' 
                  : 'Aguardando o ministro definir o repertório'}
              </p>
              {isMinistro && (
                <button
                  onClick={() => setMostrarModalMusica(true)}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Adicionar Música
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {escala.musicas.map((musica, index) => (
                <div 
                  key={musica.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition"
                  style={{ borderLeft: `4px solid ${musica.cor_paleta || '#6B1D96'}` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-gray-400 font-mono">#{index + 1}</span>
                      <p className="font-bold text-gray-800">{musica.titulo}</p>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Tom: {musica.tom}
                      </span>
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: musica.cor_paleta || '#6B1D96' }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">{musica.artista || 'Autor desconhecido'}</p>
                    {musica.link && (
                      <a href={musica.link} target="_blank" rel="noopener noreferrer" 
                         className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1">
                        <LinkIcon className="w-3 h-3" /> Ouvir
                      </a>
                    )}
                    {musica.letra && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          📝 Ver Letra
                        </summary>
                        <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border">
                          {musica.letra}
                        </pre>
                      </details>
                    )}
                    {musica.cifra && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          🎸 Ver Cifra
                        </summary>
                        <pre className="mt-2 text-sm font-mono text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border">
                          {musica.cifra}
                        </pre>
                      </details>
                    )}
                  </div>
                  {isMinistro && (
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => {
                          setEditandoMusica(musica);
                          setFormMusica({
                            titulo: musica.titulo,
                            artista: musica.artista || '',
                            tom: musica.tom || 'C',
                            cor_paleta: musica.cor_paleta || '#6B1D96',
                            link: musica.link || '',
                            letra: musica.letra || '',
                            cifra: musica.cifra || ''
                          });
                          setMostrarModalMusica(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => removerMusica(musica.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* Modal Adicionar/Editar Música */}
      {mostrarModalMusica && isMinistro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {editandoMusica ? 'Editar Música' : 'Adicionar Música'}
              </h2>
              <button onClick={() => {
                setMostrarModalMusica(false);
                setEditandoMusica(null);
              }} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  value={formMusica.titulo}
                  onChange={(e) => setFormMusica({...formMusica, titulo: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite o título da música"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Artista</label>
                <input
                  type="text"
                  value={formMusica.artista}
                  onChange={(e) => setFormMusica({...formMusica, artista: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Nome do artista/banda"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tom</label>
                  <select
                    value={formMusica.tom}
                    onChange={(e) => setFormMusica({...formMusica, tom: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  >
                    {tons.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paleta de Cores</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formMusica.cor_paleta}
                      onChange={(e) => setFormMusica({...formMusica, cor_paleta: e.target.value})}
                      className="w-12 h-10 border rounded"
                    />
                    <span className="text-sm text-gray-500">{formMusica.cor_paleta}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (YouTube, Spotify)</label>
                <input
                  type="url"
                  value={formMusica.link}
                  onChange={(e) => setFormMusica({...formMusica, link: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Letra</label>
                <textarea
                  value={formMusica.letra}
                  onChange={(e) => setFormMusica({...formMusica, letra: e.target.value})}
                  rows={6}
                  className="w-full border rounded-lg p-2 font-mono text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite a letra da música..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cifra (com acordes)</label>
                <textarea
                  value={formMusica.cifra}
                  onChange={(e) => setFormMusica({...formMusica, cifra: e.target.value})}
                  rows={4}
                  className="w-full border rounded-lg p-2 font-mono text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Digite a cifra com acordes..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-2">
              <button onClick={adicionarMusica} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editandoMusica ? 'Atualizar Música' : 'Adicionar à Escala'}
              </button>
              <button onClick={() => {
                setMostrarModalMusica(false);
                setEditandoMusica(null);
              }} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}