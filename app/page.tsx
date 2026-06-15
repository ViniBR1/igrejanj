'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, DollarSign, BookOpen, Calendar, MapPin, 
  Clock, ChevronLeft, ChevronRight, Church, 
  Users, Bell, AlertCircle, Info, X, ShoppingBag
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Logo from '@/components/Logo';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data_evento: string;
  local: string;
  imagem_url: string;
  ativo: boolean;
}

interface Aviso {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: number;
  data_fim: string;
  criado_em: string;
}

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [avisoFechado, setAvisoFechado] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  useEffect(() => {
    carregarEventos();
    carregarAvisos();
    
    const fechados = localStorage.getItem('avisosFechados');
    if (fechados) {
      setAvisoFechado(JSON.parse(fechados));
    }
  }, []);

  const carregarEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAvisos = async () => {
    try {
      const response = await fetch('/api/avisos?ativos=true');
      const data = await response.json();
      setAvisos(data);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    }
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fecharAviso = (id: number) => {
    const novosFechados = [...avisoFechado, id];
    setAvisoFechado(novosFechados);
    localStorage.setItem('avisosFechados', JSON.stringify(novosFechados));
  };

  const servicos = [
    { 
      icon: DollarSign, 
      title: 'Dízimo e Ofertas', 
      desc: 'Contribua com segurança via PIX',
      link: '/dizimo',
      bg: 'bg-gray-100',
      color: 'text-black'
    },
    { 
      icon: Heart, 
      title: 'Pedidos de Oração', 
      desc: 'Compartilhe sua necessidade',
      link: '/oracao',
      bg: 'bg-gray-100',
      color: 'text-black'
    },
    { 
      icon: BookOpen, 
      title: 'Estudos Bíblicos', 
      desc: 'Materiais para download',
      link: '/estudos',
      bg: 'bg-gray-100',
      color: 'text-black'
    },
    { 
      icon: ShoppingBag, 
      title: 'NJ Store', 
      desc: 'Produtos oficiais da igreja',
      link: '/loja',
      bg: 'bg-gray-100',
      color: 'text-black'
    }
  ];

  const avisosAtivos = avisos.filter(a => !avisoFechado.includes(a.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mural de Avisos */}
      {avisosAtivos.length > 0 && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            {avisosAtivos.map((aviso) => (
              <div key={aviso.id} className={`relative p-4 rounded-lg mb-2 ${
                aviso.tipo === 'urgente' ? 'bg-red-50 border border-red-200' :
                aviso.tipo === 'evento' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <button 
                  onClick={() => fecharAviso(aviso.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3 pr-6">
                  {aviso.tipo === 'urgente' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  {aviso.tipo === 'evento' && <Calendar className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                  {aviso.tipo === 'informativo' && <Bell className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <h3 className={`font-bold ${
                      aviso.tipo === 'urgente' ? 'text-red-800' :
                      aviso.tipo === 'evento' ? 'text-green-800' : 'text-gray-800'
                    }`}>{aviso.titulo}</h3>
                    <p className="text-gray-600 text-sm">{aviso.mensagem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section - Preto e Branco */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Bem-vindo à Igreja Nova Jerusalém
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Uma igreja que ama, acolhe e transforma vidas através do amor de Cristo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dizimo" 
              className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
            >
              Contribuir Agora
            </Link>
            <Link 
              href="/oracao" 
              className="border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition transform hover:scale-105"
            >
              Pedir Oração
            </Link>
          </div>
        </div>
      </section>

      {/* Carrossel de Eventos */}
      {eventos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Próximos Eventos
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Participe dos nossos eventos e cultos especiais
              </p>
            </div>

            <div className="relative group">
              <div className="embla overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex">
                  {eventos.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="embla__slide min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4"
                    >
                      <Link href={`/eventos/${evento.id}`}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group/card border border-gray-200">
                          <div className="relative h-56 overflow-hidden">
                            {evento.imagem_url ? (
                              <div 
                                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover/card:scale-110"
                                style={{ backgroundImage: `url(${evento.imagem_url})` }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Calendar className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition" />
                            <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {formatarData(evento.data_evento)}
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                              {evento.titulo}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {evento.descricao || 'Venha participar deste evento especial!'}
                            </p>
                            
                            <div className="space-y-2 text-sm text-gray-500">
                              {evento.local && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="line-clamp-1">{evento.local}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>
                                  {new Date(evento.data_evento).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <span className="text-black font-semibold text-sm flex items-center gap-1">
                                Saiba mais →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {eventos.length > 3 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Seção de Serviços */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Nossos Serviços
            </h2>
            <p className="text-gray-600 text-lg">
              Encontre tudo o que você precisa para sua jornada de fé
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {servicos.map((servico, index) => (
              <Link 
                key={index}
                href={servico.link}
                className="group bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
              >
                <div className={`w-20 h-20 ${servico.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition border border-gray-200`}>
                  <servico.icon className={`w-10 h-10 ${servico.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{servico.title}</h3>
                <p className="text-gray-600">{servico.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Versículo */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl italic text-gray-800 mb-4 leading-relaxed">
              "Cada um contribua segundo tiver proposto no coração, não com tristeza ou por necessidade; 
              porque Deus ama ao que dá com alegria."
            </p>
            <p className="text-lg text-gray-600 font-semibold">- 2 Coríntios 9:7</p>
          </div>
        </div>
      </section>

      {/* Horários */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Horários dos Cultos
            </h2>
            <p className="text-gray-600 text-lg">
              Venha nos visitar e adorar a Deus conosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Church className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Domingo</h3>
              <div className="space-y-2 text-gray-600">
                <p>09:00 - Culto da Família</p>
                <p>18:00 - Culto da Juventude</p>
                <p>19:00 - Culto de Celebração</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Quarta-feira</h3>
              <div className="space-y-2 text-gray-600">
                <p>19:30 - Culto de Ensino</p>
                <p>Estudo da Palavra</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Sexta-feira</h3>
              <div className="space-y-2 text-gray-600">
                <p>19:30 - Culto de Libertação</p>
                <p>Oração e Cura Interior</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold">Igreja Nova Jerusalém</span>
          </div>
          <p className="text-gray-400">© 2024 - Todos os direitos reservados</p>
        </div>
      </footer>

      {/* Estilos CSS */}
      <style jsx global>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }
        @media (min-width: 768px) {
          .embla__slide {
            flex: 0 0 50%;
          }
        }
        @media (min-width: 1024px) {
          .embla__slide {
            flex: 0 0 33.33%;
          }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}