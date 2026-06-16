'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Music, Plus, Trash2, Edit, ArrowLeft, Search, 
  Calendar, Users, Mic, Guitar, Piano, Drum,
  Save, X, Link as LinkIcon, Eye, Play
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Musica {
  id: number;
  titulo: string;
  artista: string;
  link: string;
  tom: string;
  letra: string;
  cor_paleta: string;
  cifra: string;
}

interface Colaborador {
  id: number;
  nome: string;
  instrumento?: string;
}

export default function LouvorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('repertorio');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Musica | null>(null);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    artista: '',
    link: '',
    tom: 'C',
    letra: '',
    cor_paleta: '#6B1D96',
    cifra: ''
  });

  const tons = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    carregarDados();
  }, [status]);

  const carregarDados = async () => {
    try {
      const [musicasRes, colabsRes] = await Promise.all([
        fetch('/api/musicas'),
        fetch('/api/colaboradores?areaId=2') // área do louvor
      ]);
      setMusicas(await musicasRes.json());
      setColaboradores(await colabsRes.json());
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const salvarMusica = async () => {
    if (!form.titulo) {
      toast.error('Digite o título da música');
      return;
    }

    try {
      const response = await fetch('/api/musicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          criado_por: session?.user?.id
        })
      });

      if (response.ok) {
        toast.success('Música adicionada!');
        setMostrarModal(false);
        setForm({ titulo: '', artista: '', link: '', tom: 'C', letra: '', cor_paleta: '#6B1D96', cifra: '' });
        carregarDados();
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const musicasFiltradas = musicas.filter(m =>
    m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    m.artista.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Ministério de Louvor</h1>
                <p className="text-gray-300">Gerencie repertório, músicas e escala</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditando(null);
                setForm({ titulo: '', artista: '', link: '', tom: 'C', letra: '', cor_paleta: '#6B1D96', cifra: '' });
                setMostrarModal(true);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5" /> Nova Música
            </button>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setAba('repertorio')}
              className={`py-3 px-2 font-medium transition border-b-2 ${aba === 'repertorio' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
            >
              🎵 Repertório
            </button>
            <button
              onClick={() => setAba('escala')}
              className={`py-3 px-2 font-medium transition border-b-2 ${aba === 'escala' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
            >
              📅 Escala de Músicos
            </button>
            <button
              onClick={() => setAba('equipe')}
              className={`py-3 px-2 font-medium transition border-b-2 ${aba === 'equipe' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
            >
              👥 Equipe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* ABA: Repertório */}
        {aba === 'repertorio' && (
          <>
            {/* Busca */}
            <div className="bg-white rounded-lg p-4 shadow-md mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar música por título ou artista..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Lista de Músicas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {musicasFiltradas.map((musica) => (
                <div key={musica.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="relative h-2" style={{ backgroundColor: musica.cor_paleta || '#6B1D96' }} />
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-1">{musica.titulo}</h3>
                    <p className="text-gray-500 text-sm mb-3">{musica.artista || 'Desconhecido'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-mono">Tom: {musica.tom}</span>
                      {musica.link && (
                        <a href={musica.link} target="_blank" rel="noopener noreferrer" 
                           className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Ouvir
                        </a>
                      )}
                    </div>
                    
                    {musica.letra && (
                      <div className="mt-3 pt-3 border-t">
                        <details>
                          <summary className="text-sm font-medium cursor-pointer">📝 Ver Letra</summary>
                          <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap font-sans">
                            {musica.letra}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <button className="flex-1 bg-black text-white py-1 rounded-lg text-sm hover:bg-gray-800 flex items-center justify-center gap-1">
                        <Play className="w-4 h-4" /> Usar na Escala
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ABA: Equipe */}
        {aba === 'equipe' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Equipe de Louvor</h2>
            </div>
            <div className="divide-y">
              {colaboradores.map((colab) => (
                <div key={colab.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{colab.nome}</p>
                    <p className="text-sm text-gray-500">{colab.instrumento || 'Músico'}</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 text-sm">Atribuir Função</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Nova Música */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">{editando ? 'Editar Música' : 'Nova Música'}</h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Artista</label>
                <input
                  type="text"
                  value={form.artista}
                  onChange={(e) => setForm({...form, artista: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tom</label>
                <select
                  value={form.tom}
                  onChange={(e) => setForm({...form, tom: e.target.value})}
                  className="w-full border rounded-lg p-2"
                >
                  {tons.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cor da Paleta</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.cor_paleta}
                    onChange={(e) => setForm({...form, cor_paleta: e.target.value})}
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={form.cor_paleta}
                    onChange={(e) => setForm({...form, cor_paleta: e.target.value})}
                    className="flex-1 border rounded-lg p-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Link (YouTube, Spotify, etc)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({...form, link: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Letra</label>
                <textarea
                  value={form.letra}
                  onChange={(e) => setForm({...form, letra: e.target.value})}
                  rows={6}
                  className="w-full border rounded-lg p-2 font-mono text-sm"
                  placeholder="Digite a letra da música..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cifra (opcional)</label>
                <textarea
                  value={form.cifra}
                  onChange={(e) => setForm({...form, cifra: e.target.value})}
                  rows={4}
                  className="w-full border rounded-lg p-2 font-mono text-sm"
                  placeholder="Digite a cifra com acordes..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-2">
              <button onClick={salvarMusica} className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                Salvar
              </button>
              <button onClick={() => setMostrarModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}