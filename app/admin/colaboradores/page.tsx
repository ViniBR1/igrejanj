'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, Plus, Trash2, Edit, ArrowLeft, Search, 
  Filter, Mail, Phone, Calendar, CheckCircle, XCircle,
  User, UserPlus, Music, Mic, Coffee, Baby, Car, Shield, Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Colaborador {
  id: number;
  usuario_id: number;
  nome: string;
  email: string;
  telefone: string;
  area_id: number;
  area_nome: string;
  area_tipo: string;
  funcao: string;
  nivel: string;
  ativo: boolean;
  data_entrada: string;
}

export default function AdminColaboradoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [areas, setAreas] = useState<{id: number, nome: string, tipo: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroArea, setFiltroArea] = useState('todas');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.email === 'pastor@nj.com') {
      carregarDados();
    }
  }, [status, session]);

  const carregarDados = async () => {
    try {
      const [colabRes, areasRes] = await Promise.all([
        fetch('/api/colaboradores'),
        fetch('/api/areas')
      ]);
      
      const colabData = await colabRes.json();
      const areasData = await areasRes.json();
      
      setColaboradores(Array.isArray(colabData) ? colabData : []);
      setAreas(Array.isArray(areasData) ? areasData : []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const removerColaborador = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover ${nome} da equipe de colaboradores?`)) {
      try {
        const response = await fetch(`/api/colaboradores?id=${id}`, { method: 'DELETE' });
        
        if (response.ok) {
          toast.success(`${nome} removido com sucesso!`);
          carregarDados();
        } else {
          toast.error('Erro ao remover colaborador');
        }
      } catch (error) {
        toast.error('Erro de conexão');
      }
    }
  };

  const getAreaIcon = (areaNome: string) => {
    const iconMap: Record<string, any> = {
      'Kids': Baby,
      'Louvor': Music,
      'Estacionamento': Car,
      'Mídia': Mic,
      'Som': Mic,
      'Sala Baby': Baby,
      'Diaconia': Users,
      'Segurança': Shield,
      'Limpeza': Coffee
    };
    const Icon = iconMap[areaNome] || Users;
    return <Icon className="w-5 h-5" />;
  };

  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case 'lider':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">🎯 Líder</span>;
      case 'membro':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">👥 Membro</span>;
      case 'auxiliar':
        return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">🤝 Auxiliar</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{nivel}</span>;
    }
  };

  const colaboradoresFiltrados = Array.isArray(colaboradores) ? colaboradores.filter(c => {
    const matchBusca = c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                       c.email?.toLowerCase().includes(busca.toLowerCase()) ||
                       (c.funcao && c.funcao.toLowerCase().includes(busca.toLowerCase()));
    const matchArea = filtroArea === 'todas' || c.area_id?.toString() === filtroArea;
    return matchBusca && matchArea;
  }) : [];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
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
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Colaboradores</h1>
                <p className="text-gray-300 mt-1">Cadastre voluntários e direcione para as áreas</p>
              </div>
            </div>
            <Link href="/admin">
              <button className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition">
                <UserPlus className="w-5 h-5" />
                Voltar ao Painel
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou função..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              >
                <option value="todas">Todas as áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Colaboradores</p>
                <p className="text-2xl font-bold text-black">{colaboradores.length}</p>
              </div>
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Líderes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {colaboradores.filter(c => c.nivel === 'lider').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Áreas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{areas.length}</p>
              </div>
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Lista de Colaboradores */}
        {colaboradoresFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-gray-500 mb-4">
              {busca || filtroArea !== 'todas' 
                ? 'Tente buscar por outro termo ou remover os filtros'
                : 'Clique em "Novo Colaborador" no painel principal para começar'}
            </p>
            <Link href="/admin">
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                Ir para o Painel
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colaboradoresFiltrados.map((colab) => (
              <div key={colab.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-5">
                  {/* Cabeçalho com nome e nível */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getAreaIcon(colab.area_nome)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{colab.nome}</h3>
                        <p className="text-xs text-gray-500">{colab.area_nome}</p>
                      </div>
                    </div>
                    {getNivelBadge(colab.nivel)}
                  </div>
                  
                  {/* Função */}
                  {colab.funcao && (
                    <div className="mb-3">
                      <p className="text-sm text-purple-600 font-medium">🎯 {colab.funcao}</p>
                    </div>
                  )}
                  
                  {/* Contatos */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {colab.email}
                    </p>
                    {colab.telefone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {colab.telefone}
                      </p>
                    )}
                    {colab.data_entrada && (
                      <p className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Desde {new Date(colab.data_entrada).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/admin/colaboradores/${colab.id}/editar`} className="flex-1">
                      <button className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1">
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                    </Link>
                    <button 
                      onClick={() => removerColaborador(colab.id, colab.nome)}
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

        {/* Dica */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm flex items-center gap-2">
            💡 <strong>Dica:</strong> Colaboradores com nível "Líder" podem criar escalas e gerenciar suas equipes. 
            Você pode editar as informações a qualquer momento clicando em "Editar".
          </p>
        </div>
      </div>
    </div>
  );
}