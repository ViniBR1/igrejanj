'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Bell, Plus, Trash2, Edit, X, 
  AlertCircle, Info, Calendar, Star,
  ArrowLeft, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Aviso {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: number;
  data_fim: string;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
}

export default function GerenciarAvisosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'informativo',
    prioridade: 0,
    data_fim: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarAvisos();
    }
  }, [status, session]);

  const carregarAvisos = async () => {
    try {
      const response = await fetch('/api/avisos');
      const data = await response.json();
      setAvisos(data);
    } catch (error) {
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.titulo || !form.mensagem) {
      toast.error('Preencha título e mensagem');
      return;
    }

    try {
      const url = editandoId ? '/api/avisos' : '/api/avisos';
      const method = editandoId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editandoId,
          criado_por: session?.user?.name
        })
      });

      if (response.ok) {
        toast.success(editandoId ? 'Aviso atualizado!' : 'Aviso criado com sucesso!');
        setForm({ titulo: '', mensagem: '', tipo: 'informativo', prioridade: 0, data_fim: '' });
        setMostrarForm(false);
        setEditandoId(null);
        carregarAvisos();
      } else {
        toast.error('Erro ao salvar aviso');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const editarAviso = (aviso: Aviso) => {
    setForm({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      prioridade: aviso.prioridade,
      data_fim: aviso.data_fim?.slice(0, 16) || ''
    });
    setEditandoId(aviso.id);
    setMostrarForm(true);
  };

  const removerAviso = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este aviso?')) {
      try {
        await fetch(`/api/avisos?id=${id}`, { method: 'DELETE' });
        toast.success('Aviso removido');
        carregarAvisos();
      } catch (error) {
        toast.error('Erro ao remover aviso');
      }
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'evento': return <Calendar className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'evento': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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
                  <h1 className="text-3xl font-bold">Mural de Avisos</h1>
                  <p className="mt-1">Gerencie os avisos da igreja</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditandoId(null);
                setForm({ titulo: '', mensagem: '', tipo: 'informativo', prioridade: 0, data_fim: '' });
                setMostrarForm(true);
              }}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" /> Novo Aviso
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Formulário Modal */}
        {mostrarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editandoId ? 'Editar Aviso' : 'Novo Aviso'}</h2>
                <button onClick={() => { setMostrarForm(false); setEditandoId(null); }} className="text-gray-500 hover:text-gray-700">
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
                  <label className="block text-sm font-medium mb-1">Mensagem *</label>
                  <textarea
                    value={form.mensagem}
                    onChange={(e) => setForm({...form, mensagem: e.target.value})}
                    rows={4}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({...form, tipo: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="informativo">📢 Informativo</option>
                      <option value="evento">🎉 Evento</option>
                      <option value="urgente">⚠️ Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Prioridade</label>
                    <select
                      value={form.prioridade}
                      onChange={(e) => setForm({...form, prioridade: parseInt(e.target.value)})}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value={0}>Normal</option>
                      <option value={1}>Destaque</option>
                      <option value={2}>Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de expiração (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.data_fim}
                    onChange={(e) => setForm({...form, data_fim: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para não expirar</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    {editandoId ? 'Atualizar' : 'Salvar Aviso'}
                  </button>
                  <button type="button" onClick={() => { setMostrarForm(false); setEditandoId(null); }} className="bg-gray-300 px-6 py-2 rounded-lg">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Avisos */}
        {avisos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Bell className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum aviso cadastrado</h3>
            <p className="text-gray-500 mb-4">Clique em "Novo Aviso" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {avisos.map((aviso) => (
              <div key={aviso.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                aviso.tipo === 'urgente' ? 'border-red-500' :
                aviso.tipo === 'evento' ? 'border-green-500' : 'border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    {getTipoIcon(aviso.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-xl font-bold">{aviso.titulo}</h3>
                        {aviso.prioridade > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> Destaque
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${getTipoCor(aviso.tipo)}`}>
                          {aviso.tipo === 'urgente' ? '⚠️ Urgente' : aviso.tipo === 'evento' ? '🎉 Evento' : '📢 Informativo'}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{aviso.mensagem}</p>
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>Criado: {new Date(aviso.criado_em).toLocaleDateString('pt-BR')}</span>
                        {aviso.data_fim && (
                          <span>Expira: {new Date(aviso.data_fim).toLocaleDateString('pt-BR')}</span>
                        )}
                        <span>Por: {aviso.criado_por || 'Pastor'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editarAviso(aviso)} className="text-blue-500 hover:text-blue-700">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => removerAviso(aviso.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}