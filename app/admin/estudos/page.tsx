'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  BookOpen, Plus, Trash2, Edit, Upload, X, 
  Download, Calendar, ArrowLeft, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Estudo {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  arquivo_url: string;
  downloads: number;
  criado_por: string;
  criado_em: string;
}

export default function GerenciarEstudosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    arquivo: null as File | null
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarEstudos();
    }
  }, [status, session]);

  const carregarEstudos = async () => {
    try {
      const response = await fetch('/api/estudos');
      const data = await response.json();
      setEstudos(data);
    } catch (error) {
      toast.error('Erro ao carregar estudos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.titulo || !form.arquivo) {
      toast.error('Preencha título e selecione um arquivo PDF');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('descricao', form.descricao);
    formData.append('categoria', form.categoria);
    formData.append('criado_por', session?.user?.name || 'Pastor');
    formData.append('file', form.arquivo);

    try {
      const response = await fetch('/api/estudos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Estudo adicionado com sucesso!');
        setForm({ titulo: '', descricao: '', categoria: '', arquivo: null });
        setMostrarForm(false);
        carregarEstudos();
      } else {
        toast.error('Erro ao adicionar estudo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setUploading(false);
    }
  };

  const removerEstudo = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este estudo?')) {
      try {
        await fetch(`/api/estudos?id=${id}`, { method: 'DELETE' });
        toast.success('Estudo removido');
        carregarEstudos();
      } catch (error) {
        toast.error('Erro ao remover estudo');
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
                  <h1 className="text-3xl font-bold">Gerenciar Estudos</h1>
                  <p className="mt-1">Upload de estudos bíblicos em PDF</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarForm(true)}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" /> Novo Estudo
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
                <h2 className="text-2xl font-bold">Adicionar Estudo</h2>
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
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({...form, categoria: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Estudo Bíblico">📖 Estudo Bíblico</option>
                    <option value="Oração">🙏 Oração</option>
                    <option value="Família">🏠 Família</option>
                    <option value="Louvor">🎵 Louvor</option>
                    <option value="Dízimo">💰 Dízimo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Arquivo PDF *</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={(e) => setForm({...form, arquivo: e.target.files?.[0] || null})}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Selecionar PDF
                    </button>
                    {form.arquivo && (
                      <span className="text-sm text-gray-600 self-center">
                        {form.arquivo.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas arquivos PDF (máximo 10MB)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Enviando...' : 'Salvar Estudo'}
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-6 py-2 rounded-lg">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Estudos */}
        {estudos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum estudo cadastrado</h3>
            <p className="text-gray-500 mb-4">Clique em "Novo Estudo" para começar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estudos.map((estudo) => (
              <div key={estudo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                      {estudo.titulo}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => removerEstudo(estudo.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {estudo.categoria && (
                    <div className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mb-2">
                      {estudo.categoria}
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {estudo.descricao || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{estudo.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(estudo.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
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