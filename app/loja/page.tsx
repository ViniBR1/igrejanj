'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Truck, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string;
  estoque: number;
  tamanhos: string[];
}

interface CarrinhoItem {
  id: number;
  nome: string;
  preco: number;
  tamanho: string;
  quantidade: number;
  imagem: string;
}

export default function LojaPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('todas');
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);

  useEffect(() => {
    carregarProdutos();
    carregarCarrinho();
  }, [categoria]);

  const carregarProdutos = async () => {
    try {
      const url = categoria === 'todas' ? '/api/produtos' : `/api/produtos?categoria=${categoria}`;
      const response = await fetch(url);
      const data = await response.json();
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

  const carregarCarrinho = () => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      setCarrinho(JSON.parse(saved));
    }
  };

  const adicionarAoCarrinho = (produto: Produto, tamanho: string) => {
    console.log('Adicionando:', produto.nome, tamanho);
    
    if (produto.estoque === 0) {
      toast.error('Produto esgotado!');
      return;
    }

    // Recuperar carrinho atual do localStorage
    const carrinhoAtual = localStorage.getItem('carrinho');
    let carrinhoNovo = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];
    
    // Verificar se o produto já existe no carrinho com o mesmo tamanho
    const itemExistente = carrinhoNovo.find((i: any) => i.id === produto.id && i.tamanho === tamanho);
    
    if (itemExistente) {
      // Atualizar quantidade
      carrinhoNovo = carrinhoNovo.map((i: any) =>
        i.id === produto.id && i.tamanho === tamanho
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      );
    } else {
      // Adicionar novo item
      carrinhoNovo.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        tamanho: tamanho,
        quantidade: 1,
        imagem: produto.imagem_url
      });
    }
    
    // Salvar no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinhoNovo));
    setCarrinho(carrinhoNovo);
    
    toast.success(`${produto.nome} (${tamanho}) adicionado ao carrinho!`);
    
    // Opcional: mostrar um alerta visual
    console.log('Carrinho agora tem:', carrinhoNovo.length, 'itens');
  };

  const categorias = [
    { id: 'todas', nome: 'Todos os produtos', icon: '🛍️' },
    { id: 'Vestuário', nome: 'Vestuário', icon: '👕' },
    { id: 'Livros', nome: 'Livros', icon: '📚' },
    { id: 'Acessórios', nome: 'Acessórios', icon: '🎁' },
  ];

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xl font-bold">NJ Store</span>
            </Link>
            <button
              onClick={() => router.push('/carrinho')}
              className="relative bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Carrinho</span>
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">NJ Store</h1>
          <p className="text-lg opacity-90">Produtos oficiais da Igreja Nova Jerusalém</p>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  categoria === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.icon} {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Produtos */}
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Volte em breve para novidades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
                {/* Imagem */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  {produto.imagem_url ? (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  {produto.estoque < 5 && produto.estoque > 0 && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Últimas unidades
                    </span>
                  )}
                  {produto.estoque === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Esgotado
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <div className="text-sm text-purple-600 mb-1">{produto.categoria}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{produto.nome}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{produto.descricao}</p>
                  <div className="text-2xl font-bold text-purple-600 mb-3">
                    R$ {produto.preco.toFixed(2)}
                  </div>
                  
                  {/* Botões de tamanho */}
                  {produto.tamanhos && produto.tamanhos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {produto.tamanhos.map((tamanho) => (
                          <button
                            key={tamanho}
                            onClick={() => adicionarAoCarrinho(produto, tamanho)}
                            disabled={produto.estoque === 0}
                            className="flex-1 min-w-[60px] bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {tamanho === 'Único' ? 'Comprar' : tamanho}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        Clique no tamanho para adicionar ao carrinho
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => adicionarAoCarrinho(produto, 'Único')}
                      disabled={produto.estoque === 0}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      Adicionar ao Carrinho
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t">
          <div className="text-center">
            <Truck className="w-10 h-10 mx-auto text-purple-600 mb-2" />
            <h4 className="font-bold">Entrega Segura</h4>
            <p className="text-sm text-gray-500">Enviamos para todo Brasil</p>
          </div>
          <div className="text-center">
            <CreditCard className="w-10 h-10 mx-auto text-purple-600 mb-2" />
            <h4 className="font-bold">Pagamento Seguro</h4>
            <p className="text-sm text-gray-500">Pague com cartão ou PIX</p>
          </div>
          <div className="text-center">
            <Shield className="w-10 h-10 mx-auto text-purple-600 mb-2" />
            <h4 className="font-bold">Produtos Oficiais</h4>
            <p className="text-sm text-gray-500">Garantia de qualidade</p>
          </div>
        </div>
      </div>
    </div>
  );
}