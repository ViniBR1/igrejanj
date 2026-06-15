'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

// Lista de colaboradores (por enquanto fixa, depois pode salvar no localStorage)
const [colaboradores, setColaboradores] = useState([
  { id: 1, nome: "Carlos", email: "carlos@nj.com", area: "cantina", ativo: true },
  { id: 2, nome: "Maria", email: "maria@nj.com", area: "eventos", ativo: true },
  { id: 3, nome: "João", email: "joao@nj.com", area: "acolhida", ativo: true },
]);

export default function AdminPage() {
  const { data: session } = useSession();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    email: "",
    area: "",
    senha: "123456"
  });

  if (session?.user?.tipo !== "admin") {
    return <div className="p-8 text-center">Acesso negado. Área restrita ao Pastor.</div>;
  }

  const adicionarColaborador = () => {
    if (!novoColaborador.nome || !novoColaborador.email || !novoColaborador.area) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const novo = {
      id: colaboradores.length + 1,
      ...novoColaborador,
      ativo: true
    };

    setColaboradores([...colaboradores, novo]);
    setNovoColaborador({ nome: "", email: "", area: "", senha: "123456" });
    setMostrarForm(false);
    toast.success("Colaborador adicionado!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Painel do Pastor</h1>
          <p>Bem-vindo, {session?.user?.name}</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Cards de estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-gray-500">Total Colaboradores</p>
            <p className="text-2xl font-bold">{colaboradores.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-8 h-8 bg-green-100 rounded-full mb-2"></div>
            <p className="text-gray-500">Áreas Ativas</p>
            <p className="text-2xl font-bold">3</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-8 h-8 bg-blue-100 rounded-full mb-2"></div>
            <p className="text-gray-500">Total de Voluntários</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>

        {/* Botão adicionar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Colaboradores</h2>
          <button 
            onClick={() => setMostrarForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus className="w-5 h-5" /> Adicionar Colaborador
          </button>
        </div>

        {/* Formulário de adicionar */}
        {mostrarForm && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Novo Colaborador</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={novoColaborador.nome}
                onChange={(e) => setNovoColaborador({...novoColaborador, nome: e.target.value})}
                className="border rounded-lg p-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoColaborador.email}
                onChange={(e) => setNovoColaborador({...novoColaborador, email: e.target.value})}
                className="border rounded-lg p-2"
              />
              <select
                value={novoColaborador.area}
                onChange={(e) => setNovoColaborador({...novoColaborador, area: e.target.value})}
                className="border rounded-lg p-2"
              >
                <option value="">Selecione a área</option>
                <option value="cantina">Cantina</option>
                <option value="eventos">Eventos</option>
                <option value="acolhida">Acolhida</option>
                <option value="louvor">Louvor</option>
                <option value="midia">Mídia</option>
                <option value="dizimo">Dízimo</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={adicionarColaborador} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                Salvar
              </button>
              <button onClick={() => setMostrarForm(false)} className="bg-gray-300 px-4 py-2 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de colaboradores */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Área</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((colab) => (
                <tr key={colab.id} className="border-t">
                  <td className="p-3">{colab.nome}</td>
                  <td className="p-3">{colab.email}</td>
                  <td className="p-3">{colab.area}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      Ativo
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:text-blue-700 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}