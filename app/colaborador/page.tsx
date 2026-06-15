'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Eye, CheckCircle, Clock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface Pedido {
  id: number;
  nome: string;
  motivo: string;
  contato: string;
  data: string;
  status: string;
  oracoes: number;
}

export default function ColaboradorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState('pendente');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      carregarPedidos();
    }
  }, [status, router]);

  const carregarPedidos = async () => {
    try {
      const response = await fetch('/api/oracoes');
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id: number, novoStatus: string) => {
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

  const incrementarOracao = async (id: number, oracoesAtuais: number) => {
    try {
      const response = await fetch(`/api/oracoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oracoes: oracoesAtuais + 1 })
      });

      if (response.ok) {
        toast.success('🙏 Oração registrada!');
        carregarPedidos();
      }
    } catch (error) {
      toast.error('Erro ao registrar oração');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => filtro === 'todos' || p.status === filtro);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Painel do Colaborador</h1>
          <p>Bem-vindo, {session?.user?.name}</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltro('pendente')}
              className={`px-4 py-2 rounded-lg ${filtro === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            >
              Pendentes ({pedidos.filter(p => p.status === 'pendente').length})
            </button>
            <button
              onClick={() => setFiltro('orando')}
              className={`px-4 py-2 rounded-lg ${filtro === 'orando' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Em Oração ({pedidos.filter(p => p.status === 'orando').length})
            </button>
            <button
              onClick={() => setFiltro('concluido')}
              className={`px-4 py-2 rounded-lg ${filtro === 'concluido' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Concluídos ({pedidos.filter(p => p.status === 'concluido').length})
            </button>
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg ${filtro === 'todos' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
              Todos ({pedidos.length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum pedido de oração encontrado</p>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{pedido.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {pedido.status === 'pendente' && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Pendente
                      </span>
                    )}
                    {pedido.status === 'orando' && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Em oração
                      </span>
                    )}
                    {pedido.status === 'concluido' && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Concluído
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{pedido.motivo}</p>

                {pedido.contato && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Contato: {pedido.contato}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span className="text-sm">{pedido.oracoes} pessoas oraram</span>
                  </div>

                  <div className="flex gap-2">
                    {pedido.status !== 'concluido' && (
                      <>
                        <button
                          onClick={() => incrementarOracao(pedido.id, pedido.oracoes)}
                          className="bg-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-pink-600"
                        >
                          🙏 Orei por isso
                        </button>
                        {pedido.status === 'pendente' && (
                          <button
                            onClick={() => atualizarStatus(pedido.id, 'orando')}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                          >
                            Iniciar Oração
                          </button>
                        )}
                        {pedido.status === 'orando' && (
                          <button
                            onClick={() => atualizarStatus(pedido.id, 'concluido')}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                          >
                            Concluir
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}