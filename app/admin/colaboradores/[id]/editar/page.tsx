'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditarColaboradorPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [areas, setAreas] = useState<{id: number, nome: string}[]>([]);
  const [colaborador, setColaborador] = useState({
    id: '',
    nome: '',
    email: '',
    telefone: '',
    area_id: '',
    funcao: '',
    nivel: 'membro'
  });

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
        fetch(`/api/colaboradores?id=${params.id}`),
        fetch('/api/areas')
      ]);
      
      const colabData = await colabRes.json();
      const areasData = await areasRes.json();
      
      setColaborador({
        id: colabData.id,
        nome: colabData.nome,
        email: colabData.email,
        telefone: colabData.telefone || '',
        area_id: colabData.area_id?.toString() || '',
        funcao: colabData.funcao || '',
        nivel: colabData.nivel || 'membro'
      });
      setAreas(areasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const response = await fetch(`/api/colaboradores?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_id: parseInt(colaborador.area_id),
          funcao: colaborador.funcao,
          nivel: colaborador.nivel
        })
      });

      if (response.ok) {
        toast.success('Colaborador atualizado!');
        router.push('/admin/colaboradores');
      } else {
        toast.error('Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin/colaboradores">
              <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Editar Colaborador</h1>
              <p className="text-gray-300">{colaborador.nome}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Dados Pessoais */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>{colaborador.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{colaborador.email}</span>
              </div>
              {colaborador.telefone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{colaborador.telefone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Responsabilidades */}
          <div>
            <h2 className="text-xl font-bold mb-4">Responsabilidades</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área de Atuação *
                </label>
                <select
                  value={colaborador.area_id}
                  onChange={(e) => setColaborador({...colaborador, area_id: e.target.value})}
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
                  value={colaborador.funcao}
                  onChange={(e) => setColaborador({...colaborador, funcao: e.target.value})}
                  placeholder="Ex: Ministro de Louvor, Diácono, Coordenador"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível *
                </label>
                <select
                  value={colaborador.nivel}
                  onChange={(e) => setColaborador({...colaborador, nivel: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                >
                  <option value="lider">🎯 Líder (faz escalas)</option>
                  <option value="membro">👥 Membro</option>
                  <option value="auxiliar">🤝 Auxiliar</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {colaborador.nivel === 'lider' ? 'Pode criar escalas e gerenciar a equipe' : 
                    colaborador.nivel === 'membro' ? 'Participa das escalas' : 
                    'Auxilia em tarefas específicas'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={salvar}
                disabled={salvando}
                className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
              >
                {salvando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}