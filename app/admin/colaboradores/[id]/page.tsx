'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Colaborador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  area_id: number;
  area_nome: string;
  funcao: string;
  nivel: string;
}

export default function EditarColaboradorPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [areas, setAreas] = useState<{id: number, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    funcao: '',
    nivel: 'membro',
    area_id: ''
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
        fetch(`/api/colaboradores/${params.id}`),
        fetch('/api/areas')
      ]);
      
      const colabData = await colabRes.json();
      const areasData = await areasRes.json();
      
      setColaborador(colabData);
      setAreas(areasData);
      setForm({
        funcao: colabData.funcao || '',
        nivel: colabData.nivel || 'membro',
        area_id: colabData.area_id?.toString() || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    try {
      const response = await fetch(`/api/colaboradores/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        toast.success('Responsabilidades atualizadas!');
        router.push('/admin/colaboradores');
      }
    } catch (error) {
      toast.error('Erro ao salvar');
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
              <p className="text-gray-300">{colaborador?.nome}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Dados do Colaborador */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>{colaborador?.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{colaborador?.email}</span>
              </div>
              {colaborador?.telefone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{colaborador?.telefone}</span>
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
                  Área de Atuação
                </label>
                <select
                  value={form.area_id}
                  onChange={(e) => setForm({...form, area_id: e.target.value})}
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
                  value={form.funcao}
                  onChange={(e) => setForm({...form, funcao: e.target.value})}
                  placeholder="Ex: Ministro de Louvor, Diácono, Coordenador"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível
                </label>
                <select
                  value={form.nivel}
                  onChange={(e) => setForm({...form, nivel: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black"
                >
                  <option value="lider">🎯 Líder</option>
                  <option value="membro">👥 Membro</option>
                  <option value="auxiliar">🤝 Auxiliar</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={salvar}
                className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
              >
                <Save className="w-5 h-5" />
                Salvar Responsabilidades
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}