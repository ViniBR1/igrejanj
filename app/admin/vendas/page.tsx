'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ShoppingBag, DollarSign, ArrowLeft, RefreshCw, CheckCircle,
  Clock, XCircle, Eye, Trash2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Pedido {
  id: number;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  cliente_cpf: string;
  total: string;
  status: string;
  preference_id: string;
  payment_id: string;
  criado_em: string;
  itens?: ItemPedido[];
}

interface ItemPedido {
  id: number;
  nome_produto: string;
  tamanho: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export default function VendasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [estatisticas, setEstatisticas] = useState({
    totalPedidos: 0,
    totalVendas: 0,
    pedidosPendentes: 0,
    pedidosConcluidos: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarPedidos();
    }
  }, [status, session, filtro]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const url = filtro === 'todos' ? '/api/pedidos' : `/api/pedidos?status=${filtro}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Pedidos carregados:', data);
      setPedidos(data);
      
      // Calcular vendas apenas dos aprovados
      const vendas = data
        .filter((p: Pedido) => p.status === 'aprovado')
        .reduce((acc: number, p: Pedido) => acc + Number(p.total), 0);
      
      const pendentes = data.filter((p: Pedido) => p.status === 'pendente').length;
      const concluidos = data.filter((p: Pedido) => p.status === 'aprovado').length;
      
      setEstatisticas({
        totalPedidos: data.length,
        totalVendas: vendas,
        pedidosPendentes: pendentes,
        pedidosConcluidos: concluidos
      });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const aprovarPedido = async (id: number) => {
    try {
      const response = await fetch('/api/pedidos/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Pedido #${id} aprovado!`);
        carregarPedidos();
      } else {
        toast.error('Erro ao aprovar pedido');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro de conexão');
    }
  };

  const aprovarTodosPendentes = async () => {
    try {
      const response = await fetch('/api/pedidos/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`${data.atualizados || 0} pedidos aprovados!`);
        carregarPedidos();
      } else {
        toast.error('Erro ao aprovar pedidos');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro de conexão');
    }
  };

  const excluirPedido = async (id: number) => {
    if (confirm(`Tem certeza que deseja excluir o pedido #${id}?`)) {
      try {
        const response = await fetch(`/api/pedidos?id=${id}`, { method: 'DELETE' });
        
        if (response.ok) {
          toast.success(`Pedido #${id} excluído!`);
          carregarPedidos();
        } else {
          toast.error('Erro ao excluir pedido');
        }
      } catch (error) {
        toast.error('Erro de conexão');
      }
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarValor = (valor: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
      case 'pendente':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
      default:
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelado</span>;
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
                  <h1 className="text-3xl font-bold">Dashboard de Vendas</h1>
                  <p className="mt-1">Gerencie os pedidos da NJ Store</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {estatisticas.pedidosPendentes > 0 && (
                <button 
                  onClick={aprovarTodosPendentes}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar Todos ({estatisticas.pedidosPendentes})
                </button>
              )}
              <button 
                onClick={carregarPedidos}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Pedidos</p>
                <p className="text-3xl font-bold text-purple-600">{estatisticas.totalPedidos}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-purple-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Vendas Totais</p>
                <p className="text-3xl font-bold text-green-600">{formatarValor(estatisticas.totalVendas.toString())}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pedidos Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600">{estatisticas.pedidosPendentes}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pedidos Concluídos</p>
                <p className="text-3xl font-bold text-blue-600">{estatisticas.pedidosConcluidos}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setFiltro('todos')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === 'todos' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({estatisticas.totalPedidos})
            </button>
            <button 
              onClick={() => setFiltro('pendente')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === 'pendente' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendentes ({estatisticas.pedidosPendentes})
            </button>
            <button 
              onClick={() => setFiltro('aprovado')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === 'aprovado' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aprovados ({estatisticas.pedidosConcluidos})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">Faça uma compra na loja para testar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
                      <p className="text-sm text-gray-500">{formatarData(pedido.criado_em)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(pedido.status)}
                      {pedido.status === 'pendente' && (
                        <button
                          onClick={() => aprovarPedido(pedido.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </button>
                      )}
                      <button
                        onClick={() => excluirPedido(pedido.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Dados do Cliente */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2 text-gray-700">Dados do Cliente</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Nome:</span> {pedido.cliente_nome}</p>
                      <p><span className="text-gray-500">CPF:</span> {pedido.cliente_cpf}</p>
                      <p><span className="text-gray-500">Telefone:</span> {pedido.cliente_telefone}</p>
                      <p><span className="text-gray-500">Email:</span> {pedido.cliente_email || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total do Pedido</span>
                    <span className="text-2xl font-bold text-purple-600">{formatarValor(pedido.total)}</span>
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