'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Users, Plus, Trash2, Heart, Church, 
  Eye, CheckCircle, Phone, RefreshCw, Download,
  Calendar, TrendingUp, DollarSign as DollarIcon, 
  Calendar as CalendarIcon, Clock, XCircle, BookOpen, 
  Bell, Package, ShoppingBag, Music, UserPlus,
  LayoutDashboard, Mail, Lock, User, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

interface Pedido {
  id: number;
  nome: string;
  motivo: string;
  contato: string;
  criado_em: string;
  status: string;
  oracoes: number;
}

interface Transacao {
  id: number;
  nome_doador: string;
  valor: string;
  tipo: string;
  status: string;
  criado_em: string;
}

interface Colaborador {
  id: number;
  nome: string;
  email: string;
  area: string;
  area_nome?: string;
  ativo: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [areas, setAreas] = useState<{id: number, nome: string}[]>([]);
  const [mostrarFormColaborador, setMostrarFormColaborador] = useState(false);
  const [filtroPedido, setFiltroPedido] = useState('todos');
  const [filtroTransacao, setFiltroTransacao] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [criando, setCriando] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    email: "",
    senha: "",
    area: "",
    telefone: "",
    funcao: "",
    nivel: "membro"
  });
  const [estatisticas, setEstatisticas] = useState({
    totalPedidos: 0,
    pendentes: 0,
    orando: 0,
    concluidos: 0,
    totalOracoes: 0
  });
  const [financeiro, setFinanceiro] = useState({
    totalDizimos: 0,
    totalOfertas: 0,
    totalGeral: 0,
    totalTransacoes: 0,
    transacoesMes: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.email === 'pastor@nj.com') {
      carregarDados();
    }
  }, [status, session]);

  const carregarDados = async () => {
    await Promise.all([
      carregarPedidos(),
      carregarTransacoes(),
      carregarColaboradores(),
      carregarAreas()
    ]);
  };

  const carregarPedidos = async () => {
    try {
      const response = await fetch('/api/oracoes');
      const data = await response.json();
      setPedidos(data);
      
      const pendentes = data.filter((p: Pedido) => p.status === 'pendente').length;
      const orando = data.filter((p: Pedido) => p.status === 'orando').length;
      const concluidos = data.filter((p: Pedido) => p.status === 'concluido').length;
      const totalOracoes = data.reduce((acc: number, p: Pedido) => acc + (p.oracoes || 0), 0);
      
      setEstatisticas({
        totalPedidos: data.length,
        pendentes,
        orando,
        concluidos,
        totalOracoes
      });
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    }
  };

  const carregarTransacoes = async () => {
    try {
      const response = await fetch('/api/transacoes');
      const data = await response.json();
      setTransacoes(data);
      
      const dizimos = data
        .filter((t: Transacao) => t.tipo === 'dizimo' && t.status === 'aprovado')
        .reduce((acc: number, t: Transacao) => acc + parseFloat(t.valor), 0);
      const ofertas = data
        .filter((t: Transacao) => t.tipo === 'oferta' && t.status === 'aprovado')
        .reduce((acc: number, t: Transacao) => acc + parseFloat(t.valor), 0);
      
      const agora = new Date();
      const transacoesMes = data.filter((t: Transacao) => {
        const dataTransacao = new Date(t.criado_em);
        return dataTransacao.getMonth() === agora.getMonth() && 
               dataTransacao.getFullYear() === agora.getFullYear();
      }).length;
      
      setFinanceiro({
        totalDizimos: dizimos,
        totalOfertas: ofertas,
        totalGeral: dizimos + ofertas,
        totalTransacoes: data.length,
        transacoesMes
      });
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const carregarColaboradores = async () => {
    try {
      const response = await fetch('/api/colaboradores');
      const data = await response.json();
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const carregarAreas = async () => {
    try {
      const response = await fetch('/api/areas');
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
    }
  };

  const adicionarColaborador = async () => {
    if (!novoColaborador.nome || !novoColaborador.email || !novoColaborador.area) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!novoColaborador.senha || novoColaborador.senha.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres");
      return;
    }

    setCriando(true);

    try {
      const checkResponse = await fetch(`/api/usuarios/check?email=${encodeURIComponent(novoColaborador.email)}`);
      const check = await checkResponse.json();
      
      if (check.exists) {
        toast.error("Este email já está em uso!");
        setCriando(false);
        return;
      }

      const userResponse = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoColaborador.nome,
          email: novoColaborador.email,
          senha: novoColaborador.senha,
          tipo: 'colaborador',
          telefone: novoColaborador.telefone || ''
        })
      });

      if (!userResponse.ok) {
        throw new Error('Erro ao criar usuário');
      }

      const user = await userResponse.json();
      
      await fetch('/api/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          area_id: parseInt(novoColaborador.area),
          funcao: novoColaborador.funcao || '',
          nivel: novoColaborador.nivel
        })
      });
      
      toast.success(`✅ Colaborador ${novoColaborador.nome} criado com sucesso!`);
      toast.success(`📧 Email: ${novoColaborador.email} | Senha: ${novoColaborador.senha}`, { duration: 8000 });
      
      setNovoColaborador({ 
        nome: "", 
        email: "", 
        senha: "", 
        area: "", 
        telefone: "",
        funcao: "",
        nivel: "membro"
      });
      setMostrarFormColaborador(false);
      carregarColaboradores();
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar colaborador');
    } finally {
      setCriando(false);
    }
  };

  const removerColaborador = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
      try {
        await fetch(`/api/colaboradores?id=${id}`, { method: 'DELETE' });
        toast.success("Colaborador removido!");
        carregarColaboradores();
      } catch (error) {
        toast.error('Erro ao remover colaborador');
      }
    }
  };

  const atualizarStatusPedido = async (id: number, novoStatus: string) => {
    try {
      const response = await fetch(`/api/oracoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        toast.success(`Pedido marcado como ${novoStatus === 'orando' ? 'em oração' : 'concluído'}`);
        carregarPedidos();
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const formatarValor = (valor: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(valor));
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroPedido === 'todos') return true;
    return p.status === filtroPedido;
  });

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroTransacao === 'todas') return true;
    return t.tipo === filtroTransacao;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
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
      <div className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Logo className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Painel do Pastor</h1>
                  <p className="mt-1 text-gray-300">Bem-vindo, {session?.user?.name || 'Jefferson Coelho'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Cards Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Dízimos</p>
                <p className="text-2xl font-bold">{formatarValor(financeiro.totalDizimos.toString())}</p>
              </div>
              <DollarIcon className="w-10 h-10 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Ofertas</p>
                <p className="text-2xl font-bold">{formatarValor(financeiro.totalOfertas.toString())}</p>
              </div>
              <Heart className="w-10 h-10 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Arrecadado</p>
                <p className="text-2xl font-bold">{formatarValor(financeiro.totalGeral.toString())}</p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-800 to-black rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Transações</p>
                <p className="text-2xl font-bold">{financeiro.totalTransacoes}</p>
              </div>
              <CalendarIcon className="w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>

        {/* Cards de Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pedidos</p>
                <p className="text-3xl font-bold text-black">{estatisticas.totalPedidos}</p>
              </div>
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <div className="mt-4 flex gap-2 text-xs flex-wrap">
              <span className="text-yellow-600">📋 {estatisticas.pendentes} pendentes</span>
              <span className="text-blue-600">🙏 {estatisticas.orando} em oração</span>
              <span className="text-green-600">✅ {estatisticas.concluidos} concluídos</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orações</p>
                <p className="text-3xl font-bold text-black">{estatisticas.totalOracoes}</p>
              </div>
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-2">pessoas já oraram pelos pedidos</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Colaboradores</p>
                <p className="text-3xl font-bold text-black">{colaboradores.length}</p>
              </div>
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-2">voluntários ativos</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Áreas Ativas</p>
                <p className="text-3xl font-bold text-black">9</p>
              </div>
              <Church className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-2">ministerios em ação</p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Gestão da Igreja
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/colaboradores">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <UserPlus className="w-4 h-4" />
                Gerenciar Colaboradores
              </button>
            </Link>
            <Link href="/admin/louvor">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <Music className="w-4 h-4" />
                Ministério de Louvor
              </button>
            </Link>
            <Link href="/admin/disponibilidade">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <Calendar className="w-4 h-4" />
                Disponibilidade
              </button>
            </Link>
            <Link href="/admin/transmissoes">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition text-sm">
                <Play className="w-4 h-4" />
                Transmissões ao Vivo
              </button>
            </Link>
          </div>
        </div>

        {/* Ações Rápidas - Conteúdo */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Conteúdo e Mídia
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/eventos">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <Calendar className="w-4 h-4" />
                Eventos
              </button>
            </Link>
            <Link href="/admin/estudos">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <BookOpen className="w-4 h-4" />
                Estudos Bíblicos
              </button>
            </Link>
            <Link href="/admin/avisos">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <Bell className="w-4 h-4" />
                Mural de Avisos
              </button>
            </Link>
          </div>
        </div>

        {/* Ações Rápidas - Financeiro */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
            <DollarIcon className="w-5 h-5" />
            Financeiro e Vendas
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/produtos">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <Package className="w-4 h-4" />
                NJ Store
              </button>
            </Link>
            <Link href="/admin/vendas">
              <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm">
                <ShoppingBag className="w-4 h-4" />
                Vendas
              </button>
            </Link>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-black">
                <DollarIcon className="w-6 h-6 text-black" />
                Transações Recentes
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setFiltroTransacao('todas')} className={`px-4 py-2 rounded-lg text-sm ${filtroTransacao === 'todas' ? 'bg-black text-white' : 'bg-gray-100'}`}>Todas</button>
                <button onClick={() => setFiltroTransacao('dizimo')} className={`px-4 py-2 rounded-lg text-sm ${filtroTransacao === 'dizimo' ? 'bg-black text-white' : 'bg-gray-100'}`}>Dízimos</button>
                <button onClick={() => setFiltroTransacao('oferta')} className={`px-4 py-2 rounded-lg text-sm ${filtroTransacao === 'oferta' ? 'bg-black text-white' : 'bg-gray-100'}`}>Ofertas</button>
              </div>
            </div>
          </div>
          <div className="divide-y">
            {transacoesFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada</div>
            ) : (
              transacoesFiltradas.slice(0, 5).map((transacao) => (
                <div key={transacao.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transacao.nome_doador}</p>
                    <p className="text-sm text-gray-500">{formatarData(transacao.criado_em)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">{formatarValor(transacao.valor)}</p>
                    <p className="text-xs text-gray-500">{transacao.tipo === 'dizimo' ? '🙏 Dízimo' : '🎁 Oferta'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Filtros de Pedidos */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFiltroPedido('todos')} className={`px-4 py-2 rounded-lg text-sm ${filtroPedido === 'todos' ? 'bg-black text-white' : 'bg-gray-100'}`}>Todos ({estatisticas.totalPedidos})</button>
            <button onClick={() => setFiltroPedido('pendente')} className={`px-4 py-2 rounded-lg text-sm ${filtroPedido === 'pendente' ? 'bg-black text-white' : 'bg-gray-100'}`}>Pendentes ({estatisticas.pendentes})</button>
            <button onClick={() => setFiltroPedido('orando')} className={`px-4 py-2 rounded-lg text-sm ${filtroPedido === 'orando' ? 'bg-black text-white' : 'bg-gray-100'}`}>Em Oração ({estatisticas.orando})</button>
            <button onClick={() => setFiltroPedido('concluido')} className={`px-4 py-2 rounded-lg text-sm ${filtroPedido === 'concluido' ? 'bg-black text-white' : 'bg-gray-100'}`}>Concluídos ({estatisticas.concluidos})</button>
          </div>
        </div>

        {/* Pedidos de Oração */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-black">
              <Heart className="w-6 h-6 text-black" />
              Pedidos de Oração
            </h2>
          </div>
          <div className="divide-y">
            {pedidosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum pedido de oração encontrado</div>
            ) : (
              pedidosFiltrados.slice(0, 5).map((pedido) => (
                <div key={pedido.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{pedido.nome}</p>
                      <p className="text-sm text-gray-600">{pedido.motivo.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Heart className="w-3 h-3 text-black" />
                        <span className="text-xs text-gray-500">{pedido.oracoes} orações</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {pedido.status === 'pendente' && (
                        <button onClick={() => atualizarStatusPedido(pedido.id, 'orando')} className="bg-black text-white px-2 py-1 rounded text-xs">Iniciar</button>
                      )}
                      {pedido.status === 'orando' && (
                        <button onClick={() => atualizarStatusPedido(pedido.id, 'concluido')} className="bg-black text-white px-2 py-1 rounded text-xs">Concluir</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Adicionar Colaborador */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-black">
              <UserPlus className="w-6 h-6 text-black" />
              Adicionar Novo Colaborador
            </h2>
            <p className="text-gray-500 text-sm mt-1">Preencha os dados para criar um novo colaborador</p>
          </div>
          
          {mostrarFormColaborador && (
            <div className="p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Ex: João da Silva"
                      value={novoColaborador.nome} 
                      onChange={(e) => setNovoColaborador({...novoColaborador, nome: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="email" 
                      placeholder="Ex: joao@igreja.com"
                      value={novoColaborador.email} 
                      onChange={(e) => setNovoColaborador({...novoColaborador, email: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Digite uma senha"
                      value={novoColaborador.senha} 
                      onChange={(e) => setNovoColaborador({...novoColaborador, senha: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">O colaborador usará esta senha para fazer login</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="tel" 
                      placeholder="(11) 99999-9999"
                      value={novoColaborador.telefone} 
                      onChange={(e) => setNovoColaborador({...novoColaborador, telefone: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área de Atuação *
                  </label>
                  <select 
                    value={novoColaborador.area} 
                    onChange={(e) => setNovoColaborador({...novoColaborador, area: e.target.value})} 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                  >
                    <option value="">Selecione uma área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Função / Cargo
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Ministro de Louvor, Diácono, Coordenador"
                    value={novoColaborador.funcao} 
                    onChange={(e) => setNovoColaborador({...novoColaborador, funcao: e.target.value})} 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível *
                  </label>
                  <select 
                    value={novoColaborador.nivel} 
                    onChange={(e) => setNovoColaborador({...novoColaborador, nivel: e.target.value})} 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                  >
                    <option value="lider">🎯 Líder (faz escalas)</option>
                    <option value="membro">👥 Membro</option>
                    <option value="auxiliar">🤝 Auxiliar</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {novoColaborador.nivel === 'lider' ? 'Pode criar escalas e gerenciar a equipe' : 
                      novoColaborador.nivel === 'membro' ? 'Participa das escalas' : 
                      'Auxilia em tarefas específicas'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={adicionarColaborador} 
                  disabled={criando}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {criando ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {criando ? 'Criando...' : 'Criar Colaborador'}
                </button>
                <button 
                  onClick={() => setMostrarFormColaborador(false)} 
                  className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {!mostrarFormColaborador && (
            <div className="p-6">
              <button 
                onClick={() => {
                  setNovoColaborador({ 
                    nome: "", 
                    email: "", 
                    senha: "123456", 
                    area: "", 
                    telefone: "",
                    funcao: "",
                    nivel: "membro"
                  });
                  setMostrarFormColaborador(true);
                }} 
                className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
              >
                <Plus className="w-5 h-5" /> 
                Novo Colaborador
              </button>
              <p className="text-sm text-gray-500 mt-3">
                💡 Após criar, o colaborador poderá fazer login com o email e senha definidos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}