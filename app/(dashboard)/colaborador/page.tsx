'use client';
import { useSession } from 'next-auth/react';

export default function ColaboradorPage() {
  const { data: session } = useSession();

  if (session?.user?.tipo !== "colaborador") {
    return <div className="p-8 text-center">Acesso negado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Painel do Colaborador</h1>
          <p>Bem-vindo, {session?.user?.name}</p>
          <p>Área: {session?.user?.area}</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Minhas Funções</h2>
          
          {session?.user?.area === "cantina" && (
            <div>
              <p>📦 Gerenciar estoque da cantina</p>
              <p>💰 Registrar vendas</p>
              <p>📊 Ver relatórios</p>
            </div>
          )}

          {session?.user?.area === "eventos" && (
            <div>
              <p>🎉 Gerenciar eventos</p>
              <p>📋 Lista de participantes</p>
              <p>🔧 Organizar equipe</p>
            </div>
          )}

          {session?.user?.area === "acolhida" && (
            <div>
              <p>👋 Recepcionar visitantes</p>
              <p>📝 Cadastrar novos membros</p>
              <p>💬 Acompanhar necessidades</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}