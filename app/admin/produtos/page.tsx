'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  Package, Plus, Trash2, Edit, Upload, X, 
  DollarSign, ArrowLeft, Loader2, Tag, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string;
  estoque: number;
  tamanhos: string[];
  ativo: boolean;
  criado_em: string;
}

export default function GerenciarProdutosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    estoque: '',
    tamanhos: [] as string[],
    imagem_url: ''
  });
  const [novoTamanho, setNovoTamanho] = useState('');

  const tamanhosDisponiveis = ['P', 'M', 'G', 'GG', 'XG', 'Único'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarProdutos();
    }
  }, [status, session]);

  const carregarProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      // Normalizar preço para número
      const produtosNormalizados = data.map((p: any) => ({
        ...p,
        preco: typeof p.preco === 'string' ? parseFloat(p.preco) : p.preco
      }));
      setProdutos(produtosNormalizados);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setForm({ ...form, imagem_url: data.url });
        toast.success('Imagem enviada!');
      }
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const adicionarTamanho = () => {
    if (novoTamanho && !form.tamanhos.includes(novoTamanho)) {
      setForm({ ...form, tamanhos: [...form.tamanhos, novoTamanho] });
      setNovoTamanho('');
    }
  };

  const removerTamanho = (tamanho: string) => {
    setForm({ ...form, tamanhos: form.tamanhos.filter(t => t !== tamanho) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nome || !form.preco) {
      toast.error('Preencha nome e preço');
      return;
    }

    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('descricao', form.descricao);
    formData.append('preco', form.preco);
    formData.append('categoria', form.categoria);
    formData.append('estoque', form.estoque || '0');
    formData.append('tamanhos', JSON.stringify(form.tamanhos));
    formData.append('criado_por', session?.user?.name || 'Pastor');
    
    if (fileInputRef.current?.files?.[0]) {
      formData.append('file', fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Produto adicionado!');
        setForm({ nome: '', descricao: '', preco: '', categoria: '', estoque: '', tamanhos: [], imagem_url: '' });
        setMostrarForm(false);
        carregarProdutos();
      } else {
        toast.error('Erro ao adicionar produto');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const removerProduto = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      try {
        await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
        toast.success('Produto removido');
        carregarProdutos();
      } catch (error) {
        toast.error('Erro ao remover produto');
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
                  <h1 className="text-3xl font-bold">NJ Store</h1>
                  <p className="mt-1">Gerencie os produtos da loja</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarForm(true)}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" /> Novo Produto
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
                <h2 className="text-2xl font-bold">Novo Produto</h2>
                <button onClick={() => setMostrarForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({...form, nome: e.target.value})}
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.preco}
                      onChange={(e) => setForm({...form, preco: e.target.value})}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estoque</label>
                    <input
                      type="number"
                      value={form.estoque}
                      onChange={(e) => setForm({...form, estoque: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({...form, categoria: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Selecione</option>
                    <option value="Vestuário">👕 Vestuário</option>
                    <option value="Livros">📚 Livros</option>
                    <option value="Acessórios">🎁 Acessórios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tamanhos</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={novoTamanho}
                      onChange={(e) => setNovoTamanho(e.target.value)}
                      className="flex-1 border rounded-lg p-2"
                    >
                      <option value="">Selecione um tamanho</option>
                      {tamanhosDisponiveis.filter(t => !form.tamanhos.includes(t)).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button type="button" onClick={adicionarTamanho} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                      Adicionar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.tamanhos.map(t => (
                      <span key={t} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removerTamanho(t)} className="text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Imagem do Produto</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload de Imagem
                    </button>
                    <input
                      type="text"
                      value={form.imagem_url}
                      onChange={(e) => setForm({...form, imagem_url: e.target.value})}
                      className="flex-1 border rounded-lg p-2"
                      placeholder="Ou cole a URL da imagem"
                    />
                  </div>
                  {form.imagem_url && (
                    <img src={form.imagem_url} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    Salvar Produto
                  </button>
                  <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-6 py-2 rounded-lg">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        {produtos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 mb-4">Clique em "Novo Produto" para começar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="relative h-48 overflow-hidden">
                  {produto.imagem_url ? (
                    <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Package className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{produto.nome}</h3>
                  <p className="text-purple-600 font-bold text-xl">
                    R$ {typeof produto.preco === 'string' ? parseFloat(produto.preco).toFixed(2) : produto.preco.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Estoque: {produto.estoque}</p>
                  {produto.tamanhos && produto.tamanhos.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">Tamanhos: {produto.tamanhos.join(', ')}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => removerProduto(produto.id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">
                      <Trash2 className="w-4 h-4 inline mr-1" /> Remover
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