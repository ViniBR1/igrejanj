'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Download, Search, Filter, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Estudo {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  arquivo_url: string;
  downloads: number;
  criado_por: string;
  criado_em: string;
}

export default function EstudosPage() {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    carregarEstudos();
  }, []);

  const carregarEstudos = async () => {
    try {
      const response = await fetch('/api/estudos');
      const data = await response.json();
      setEstudos(data);
      
      // Extrair categorias únicas - versão compatível com TypeScript
      const categoriasUnicas: string[] = [];
      data.forEach((e: Estudo) => {
        if (e.categoria && !categoriasUnicas.includes(e.categoria)) {
          categoriasUnicas.push(e.categoria);
        }
      });
      setCategorias(categoriasUnicas);
    } catch (error) {
      toast.error('Erro ao carregar estudos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number, titulo: string) => {
    try {
      const response = await fetch(`/api/estudos/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titulo}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download iniciado!');
        
        // Atualizar contador localmente
        setEstudos(estudos.map(e => 
          e.id === id ? { ...e, downloads: e.downloads + 1 } : e
        ));
      } else {
        toast.error('Erro ao baixar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao fazer download');
    }
  };

  const estudosFiltrados = estudos.filter(estudo => {
    const matchBusca = estudo.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       estudo.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoria === 'todas' || estudo.categoria === categoria;
    return matchBusca && matchCategoria;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Estudos Bíblicos
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Materiais para download e crescimento espiritual
          </p>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar estudo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-400 self-center" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Estudos */}
        {estudosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum estudo encontrado</h3>
            <p className="text-gray-500">Tente buscar por outro termo ou categoria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estudosFiltrados.map((estudo) => (
              <div key={estudo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
                <div className="p-6">
                  {/* Categoria */}
                  {estudo.categoria && (
                    <div className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mb-3">
                      {estudo.categoria}
                    </div>
                  )}
                  
                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {estudo.titulo}
                  </h3>
                  
                  {/* Descrição */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {estudo.descricao || 'Material de estudo para crescimento espiritual'}
                  </p>
                  
                  {/* Metadados */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{estudo.downloads} downloads</span>
                    </div>
                    {estudo.criado_em && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(estudo.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botão Download */}
                  <button
                    onClick={() => handleDownload(estudo.id, estudo.titulo)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {estudos.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
            <p className="text-purple-800">
              📚 Total de {estudos.length} estudos disponíveis | 
              📥 {estudos.reduce((acc, e) => acc + e.downloads, 0)} downloads no total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}