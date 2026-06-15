'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, MapPin, Clock, ArrowLeft, Share2, 
  Heart, User, Calendar as CalendarIcon, 
  CheckCircle, Home, Users, Gift 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data_evento: string;
  local: string;
  imagem_url: string;
  criado_por: string;
  criado_em: string;
  ativo: boolean;
}

export default function DetalhesEventoPage() {
  const params = useParams();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [participando, setParticipando] = useState(false);
  const [lembreteEnviado, setLembreteEnviado] = useState(false);

  useEffect(() => {
    carregarEvento();
    
    // Verificar se já salvou participação no localStorage
    const participacaoSalva = localStorage.getItem(`evento-${params.id}-participando`);
    if (participacaoSalva === 'true') {
      setParticipando(true);
    }
  }, [params.id]);

  const carregarEvento = async () => {
    try {
      const response = await fetch('/api/eventos');
      const eventos = await response.json();
      const eventoEncontrado = eventos.find((e: Evento) => e.id === parseInt(params.id as string));
      setEvento(eventoEncontrado);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      toast.error('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const compartilharEvento = () => {
    const url = window.location.href;
    const texto = `📅 ${evento?.titulo} - ${new Date(evento?.data_evento || '').toLocaleDateString('pt-BR')}\n\nParticipe conosco! 🙏`;
    
    if (navigator.share) {
      navigator.share({
        title: evento?.titulo,
        text: `Participe do evento: ${evento?.titulo}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${texto}\n\nLink: ${url}`);
      toast.success('Link copiado para compartilhar! 📋');
    }
  };

  const confirmarParticipacao = () => {
    setParticipando(true);
    localStorage.setItem(`evento-${params.id}-participando`, 'true');
    toast.success('✅ Participação confirmada! Aguardamos você!');
  };

  const adicionarLembrete = () => {
    setLembreteEnviado(true);
    toast.success('🔔 Lembrete adicionado! Você receberá uma notificação antes do evento.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CalendarIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Evento não encontrado</h1>
          <p className="text-gray-500 mb-6">O evento que você procura pode ter sido removido ou não existe.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            <Home className="w-5 h-5" />
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  const dataEvento = new Date(evento.data_evento);
  const dataFormatada = dataEvento.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const horarioFormatado = dataEvento.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const jaPassou = dataEvento < new Date();
  const falta = Math.ceil((dataEvento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const faltaTexto = falta <= 0 ? 'Hoje!' : falta === 1 ? 'Amanhã!' : `Faltam ${falta} dias`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        {evento.imagem_url ? (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${evento.imagem_url})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center">
            <CalendarIcon className="w-32 h-32 text-white opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Botão voltar */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.back()}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
        
        {/* Botão compartilhar */}
        <div className="absolute top-6 right-6">
          <button
            onClick={compartilharEvento}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Título e informações na imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full">
                {jaPassou ? 'Evento realizado' : faltaTexto}
              </span>
              {evento.local && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {evento.local}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {evento.titulo}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{dataFormatada}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{horarioFormatado}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna principal - Conteúdo */}
            <div className="lg:col-span-2 space-y-8">
              {/* Descrição */}
              {evento.descricao && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-purple-600" />
                    Sobre o evento
                  </h2>
                  <div className="prose max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {evento.descricao}
                  </div>
                </div>
              )}

              {/* Organizador */}
              {evento.criado_por && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organizado por</p>
                      <p className="text-lg font-semibold text-gray-800">{evento.criado_por}</p>
                      <p className="text-sm text-gray-500">Igreja Nova Jerusalém</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Localização detalhada */}
              {evento.local && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Localização
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700">{evento.local}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📍 Rua da Igreja, 123 - Centro, São Paulo - SP
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna lateral - Ações */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Card de participação */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quero participar!</h3>
                  
                  {!jaPassou ? (
                    <>
                      {!participando ? (
                        <button
                          onClick={confirmarParticipacao}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirmar presença
                        </button>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-semibold">Presença confirmada!</p>
                          <p className="text-sm text-green-600 mt-1">Aguardamos você!</p>
                        </div>
                      )}

                      <button
                        onClick={adicionarLembrete}
                        disabled={lembreteEnviado}
                        className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        {lembreteEnviado ? 'Lembrete adicionado' : 'Adicionar ao calendário'}
                      </button>
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Este evento já aconteceu</p>
                      <p className="text-sm text-gray-500 mt-1">Confira nossos próximos eventos</p>
                    </div>
                  )}
                </div>

                {/* Card de contribuição */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Contribua com o evento</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua oferta ajuda a realizar eventos como este e alcançar mais vidas.
                  </p>
                  <Link href="/dizimo">
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                      Fazer oferta
                    </button>
                  </Link>
                </div>

                {/* Versículo */}
                <div className="bg-white rounded-xl p-6 border-l-4 border-purple-600">
                  <p className="text-gray-600 italic text-sm">
                    "Onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles."
                  </p>
                  <p className="text-purple-600 text-sm mt-2">- Mateus 18:20</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação - Voltar para eventos */}
          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Ver todos os eventos
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}