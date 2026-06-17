'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Play, Plus, Trash2, Edit, ArrowLeft, 
  Youtube, Instagram, Facebook, Calendar, Clock,
  Link as LinkIcon, Loader2, X
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
  criado_em: string;
}

export default function AdminTransmissoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transmissoes, setTransmissoes] = useState<Transmissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    plataforma: 'youtube',
    link: '',
    data_transmissao: '',
    duracao: '',
    imagem_url: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarTransmissoes();
    }
  }, [status, session]);

  const carregarTransmissoes = async () => {
    try {
      const response = await fetch('/api/transmissoes');
      const data = await response.json();
      setTransmissoes(data);
    } catch (error) {
      toast.error('Erro ao carregar transmissões');
    } finally {
      setLoading(false);
    }
  };

  const salvarTransmissao = async () => {
    if (!form.titulo || !form.link || !form.data_transmissao) {
      toast.error('Preencha título, link e data');
      return;
    }

    try {
      const url = editandoId ? `/api/transmissoes?id=${editandoId}` : '/api/transmissoes';
      const method = editandoId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          duracao: form.duracao ? parseInt(form.duracao) : null,
          criado_por: session?.user?.id
        })
      });

      if (response.ok) {
        toast.success(editandoId ? 'Transmissão atualizada!' : 'Transmissão criada!');
        setMostrarForm(false);
        setEditandoId(null);
        setForm({ titulo: '', descricao: '', plataforma: 'youtube', link: '', data_transmissao: '', duracao: '', imagem_url: '' });
        carregarTransmissoes();
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const removerTransmissao = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await fetch(`/api/transmissoes?id=${id}`, { method: 'DELETE' });
      toast.success('Removido!');
      carregarTransmissoes();
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  const editarTransmissao = (trans: Transmissao) => {
    setEditandoId(trans.id);
    setForm({
      titulo: trans.titulo,
      descricao: trans.descricao || '',
      plataforma: trans.plataforma,
      link: trans.link,
      data_transmissao: trans.data_transmissao.slice(0, 16),
      duracao: trans.duracao?.toString() || '',
      imagem_url: trans.imagem_url || ''
    });
    setMostrarForm(true);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Transmissões ao Vivo</h1>
                <p className="text-gray-300">Gerencie as lives da igreja</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditandoId(null);
                setForm({ titulo: '', descricao: '', plataforma: 'youtube', link: '', data_transmissao: '', duracao: '', imagem_url: '' });
                setMostrarForm(true);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5" /> Nova Transmissão
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {mostrarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editandoId ? 'Editar' : 'Nova'} Transmissão</h2>
                <button onClick={() => setMostrarForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({...form, titulo: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    placeholder="Ex: Culto de Domingo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm({...form, descricao: e.target.value})}
                    rows={3}
                    className="w-full border rounded-lg p-2"
                    placeholder="Descrição da transmissão..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Plataforma</label>
                    <select
                      value={form.plataforma}
                      onChange={(e) => setForm({...form, plataforma: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="youtube">🎥 YouTube</option>
                      <option value="instagram">📱 Instagram</option>
                      <option value="facebook">📘 Facebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data e Hora *</label>
                    <input
                      type="datetime-local"
                      value={form.data_transmissao}
                      onChange={(e) => setForm({...form, data_transmissao: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link da Transmissão *</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({...form, link: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube: use o link embed (ex: https://www.youtube.com/embed/VIDEO_ID)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                    <input
                      type="number"
                      value={form.duracao}
                      onChange={(e) => setForm({...form, duracao: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                    <input
                      type="url"
                      value={form.imagem_url}
                      onChange={(e) => setForm({...form, imagem_url: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      placeholder="https://.../imagem.jpg"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-2">
                <button onClick={salvarTransmissao} className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                  {editandoId ? 'Atualizar' : 'Salvar'}
                </button>
                <button onClick={() => setMostrarForm(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {transmissoes.map((trans) => (
            <div key={trans.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {trans.plataforma === 'youtube' && <Youtube className="w-6 h-6 text-red-500" />}
                    {trans.plataforma === 'instagram' && <Instagram className="w-6 h-6 text-pink-500" />}
                    {trans.plataforma === 'facebook' && <Facebook className="w-6 h-6 text-blue-600" />}
                    <h3 className="text-xl font-bold">{trans.titulo}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${trans.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {trans.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-gray-600">{trans.descricao}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatarData(trans.data_transmissao)}
                    </span>
                    {trans.duracao && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {trans.duracao} min
                      </span>
                    )}
                    <a href={trans.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" /> Abrir
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editarTransmissao(trans)} className="text-blue-500 hover:text-blue-700 p-1">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => removerTransmissao(trans.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {transmissoes.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <Play className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nenhuma transmissão</h3>
            <p className="text-gray-500">Clique em "Nova Transmissão" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}