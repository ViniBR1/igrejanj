'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Edit, Image, MapPin, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data_evento: string;
  local: string;
  imagem_url: string;
  ativo: boolean;
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          criado_por: session?.user?.name
        })
      });

      if (response.ok) {
        toast.success('Evento criado com sucesso!');
        setForm({ titulo: '', descricao: '', data_evento: '', local: '', imagem_url: '' });
        setMostrarForm(false);
        carregarEventos();
      }
    } catch (error) {
      toast.error('Erro ao criar evento');
    }
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (session?.user?.email !== 'pastor@nj.com') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Acesso negado. Área restrita ao Pastor.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Eventos</h1>
              <p className="mt-1">Cadastre e organize os eventos da igreja</p>
            </div>
            <button
              onClick={() => setMostrarForm(true)}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5" /> Novo Evento
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Formulário */}
        {mostrarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Novo Evento</h2>
                <button onClick={() => setMostrarForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({...form, titulo: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm({...form, descricao: e.target.value})}
                    rows={3}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    value={form.data_evento}
                    onChange={(e) => setForm({...form, data_evento: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <input
                    type="text"
                    value={form.local}
                    onChange={(e) => setForm({...form, local: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    placeholder="Igreja Nova Jerusalém"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={form.imagem_url}
                    onChange={(e) => setForm({...form, imagem_url: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dica: Use imagens do Unsplash ou outra fonte gratuita
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    Salvar Evento
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Eventos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {evento.imagem_url && (
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${evento.imagem_url})` }}
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{evento.titulo}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{evento.descricao}</p>
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evento.data_evento).toLocaleString('pt-BR')}</span>
                  </div>
                  {evento.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{evento.local}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => removerEvento(evento.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {eventos.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum evento cadastrado</p>
            <button
              onClick={() => setMostrarForm(true)}
              className="mt-4 text-purple-600 hover:text-purple-700"
            >
              + Criar primeiro evento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}