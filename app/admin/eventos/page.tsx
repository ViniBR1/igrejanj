'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Calendar, Plus, Trash2, Edit, Image, MapPin, Clock, X, 
  Save, Eye, ArrowLeft, Upload, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data_evento: string;
  local: string;
  imagem_url: string;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
}

export default function GerenciarEventosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    local: '',
    imagem_url: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarEventos();
    }
  }, [status, session]);

  const carregarEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.titulo || !form.data_evento) {
      toast.error('Preencha título e data do evento');
      return;
    }

    try {
      const response = await fetch('/api/eventos', {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editandoId,
          criado_por: session?.user?.name
        })
      });

      if (response.ok) {
        toast.success(editandoId ? 'Evento atualizado!' : 'Evento criado com sucesso!');
        setForm({ titulo: '', descricao: '', data_evento: '', local: '', imagem_url: '' });
        setMostrarForm(false);
        setEditandoId(null);
        carregarEventos();
      } else {
        toast.error('Erro ao salvar evento');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const editarEvento = (evento: Evento) => {
    setForm({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      data_evento: evento.data_evento.slice(0, 16),
      local: evento.local || '',
      imagem_url: evento.imagem_url || ''
    });
    setEditandoId(evento.id);
    setMostrarForm(true);
  };

  const removerEvento = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este evento?')) {
      try {
        await fetch(`/api/eventos?id=${id}`, { method: 'DELETE' });
        toast.success('Evento removido');
        carregarEventos();
      } catch (error) {
        toast.error('Erro ao remover evento');
      }
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (session?.user?.email !== 'pastor@nj.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-bold">Acesso negado</p>
          <p className="text-sm">Área restrita ao Pastor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Gerenciar Eventos</h1>
                  <p className="mt-1">Cadastre, edite e organize os eventos da igreja</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditandoId(null);
                setForm({ titulo: '', descricao: '', data_evento: '', local: '', imagem_url: '' });
                setMostrarForm(true);
              }}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" /> Novo Evento
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Formulário Modal */}
        {mostrarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">
                  {editandoId ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                <button 
                  onClick={() => {
                    setMostrarForm(false);
                    setEditandoId(null);
                  }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({...form, titulo: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Culto de Domingo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm({...form, descricao: e.target.value})}
                    rows={4}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Descreva o evento..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.data_evento}
                      onChange={(e) => setForm({...form, data_evento: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      type="text"
                      value={form.local}
                      onChange={(e) => setForm({...form, local: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                      placeholder="Igreja Nova Jerusalém"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.imagem_url}
                      onChange={(e) => setForm({...form, imagem_url: e.target.value})}
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Dica: Use imagens do Unsplash, Pexels ou outra fonte gratuita
                  </p>
                  {form.imagem_url && (
                    <div className="mt-2">
                      <img 
                        src={form.imagem_url} 
                        alt="Preview" 
                        className="h-32 w-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit" 
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editandoId ? 'Atualizar' : 'Salvar Evento'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setMostrarForm(false);
                      setEditandoId(null);
                    }} 
                    className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Eventos */}
        {eventos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum evento cadastrado</h3>
            <p className="text-gray-500 mb-4">Clique em "Novo Evento" para começar</p>
            <button
              onClick={() => {
                setEditandoId(null);
                setForm({ titulo: '', descricao: '', data_evento: '', local: '', imagem_url: '' });
                setMostrarForm(true);
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
                {/* Imagem */}
                <div className="relative h-48 overflow-hidden">
                  {evento.imagem_url ? (
                    <div 
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${evento.imagem_url})` }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>

                {/* Conteúdo */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {evento.titulo}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{formatarData(evento.data_evento)}</span>
                    </div>
                    {evento.local && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="line-clamp-1">{evento.local}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {evento.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => editarEvento(evento)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                    <button
                      onClick={() => removerEvento(evento.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {eventos.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-gray-500">Total de Eventos</p>
                <p className="text-2xl font-bold text-purple-600">{eventos.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Próximos Eventos</p>
                <p className="text-2xl font-bold text-green-600">
                  {eventos.filter(e => new Date(e.data_evento) > new Date()).length}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Eventos Passados</p>
                <p className="text-2xl font-bold text-gray-600">
                  {eventos.filter(e => new Date(e.data_evento) < new Date()).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}