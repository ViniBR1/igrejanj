'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart, DollarSign, BookOpen, Calendar, MapPin,
  Clock, ChevronLeft, ChevronRight, Church,
  Users, Bell, AlertCircle, Info, X, ShoppingBag, Play, Download
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
    if (fechados) setAvisoFechado(JSON.parse(fechados));
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

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
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
    { icon: Play, title: 'Ao Vivo', desc: 'Assista nossos cultos', link: '/ao-vivo', bg: 'bg-red-50', color: 'text-red-600' },
    { icon: DollarSign, title: 'Dízimo', desc: 'Contribua com segurança', link: '/dizimo', bg: 'bg-gray-50', color: 'text-gray-700' },
    { icon: Heart, title: 'Oração', desc: 'Compartilhe sua necessidade', link: '/oracao', bg: 'bg-pink-50', color: 'text-pink-600' },
    { icon: BookOpen, title: 'Estudos', desc: 'Materiais para download', link: '/estudos', bg: 'bg-green-50', color: 'text-green-600' },
    { icon: ShoppingBag, title: 'Loja', desc: 'Produtos oficiais', link: '/loja', bg: 'bg-blue-50', color: 'text-blue-600' }
  ];

  const avisosAtivos = avisos.filter(a => !avisoFechado.includes(a.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
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
              <div key={aviso.id} className={`relative p-4 rounded-lg mb-2 ${aviso.tipo === 'urgente' ? 'bg-red-50 border border-red-200' : aviso.tipo === 'evento' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <button onClick={() => fecharAviso(aviso.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3 pr-6">
                  {aviso.tipo === 'urgente' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  {aviso.tipo === 'evento' && <Calendar className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                  {aviso.tipo === 'informativo' && <Bell className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <h3 className={`font-bold ${aviso.tipo === 'urgente' ? 'text-red-800' : aviso.tipo === 'evento' ? 'text-green-800' : 'text-gray-800'}`}>{aviso.titulo}</h3>
                    <p className="text-gray-600 text-sm">{aviso.mensagem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section - MENOR e mais clean */}
      <section className="bg-black text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Bem-vindo à <span className="text-red-500">Igreja Nova Jerusalém</span>
            </h1>
            <p className="text-sm md:text-base mb-5 opacity-80 max-w-xl mx-auto">
              Uma igreja que ama, acolhe e transforma vidas através do amor de Cristo
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/dizimo" className="bg-red-600 text-white px-5 md:px-7 py-2.5 rounded-full font-semibold hover:bg-red-700 transition text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" /> Contribuir
              </Link>
              <Link href="/oracao" className="border-2 border-white px-5 md:px-7 py-2.5 rounded-full font-semibold hover:bg-white hover:text-black transition text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Pedir Oração
              </Link>
              <Link href="/ao-vivo" className="bg-red-600 text-white px-5 md:px-7 py-2.5 rounded-full font-semibold hover:bg-red-700 transition text-sm flex items-center gap-2">
                <Play className="w-4 h-4" /> Ao Vivo
              </Link>
            </div>
            <div className="mt-4">
              <button className="border border-gray-600 hover:bg-white hover:text-black px-5 py-2 rounded-full transition text-sm flex items-center justify-center gap-2 mx-auto">
                <Download className="w-4 h-4" /> Instalar App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Carrossel de Eventos */}
      {eventos.length > 0 && (
        <section className="py-10 md:py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-1">Próximos Eventos</h2>
              <p className="text-gray-500 text-sm">Participe dos nossos eventos e cultos especiais</p>
            </div>

            <div className="relative group">
              <div className="embla overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="embla__slide min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4">
                      <Link href={`/eventos/${evento.id}`}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                          <div className="relative h-48 overflow-hidden">
                            {evento.imagem_url ? (
                              <div className="w-full h-full bg-cover bg-center transition-transform duration-500" style={{ backgroundImage: `url(${evento.imagem_url})` }} />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Calendar className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {formatarData(evento.data_evento)}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-black mb-1 line-clamp-1">{evento.titulo}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{evento.descricao || 'Venha participar!'}</p>
                            {evento.local && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{evento.local}</span>
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-red-600 font-semibold text-sm">Saiba mais →</span>
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
                  <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Seção de Serviços */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-1">Nossos Serviços</h2>
            <p className="text-gray-500 text-sm">Encontre tudo o que você precisa para sua jornada de fé</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {servicos.map((servico, index) => (
              <Link key={index} href={servico.link} className="group bg-white p-4 rounded-xl text-center hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className={`w-12 h-12 ${servico.bg} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition`}>
                  <servico.icon className={`w-6 h-6 ${servico.color}`} />
                </div>
                <h3 className="text-sm font-bold text-black mb-0.5">{servico.title}</h3>
                <p className="text-xs text-gray-500 hidden md:block">{servico.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Versículo */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl italic text-gray-700 mb-3 leading-relaxed">
              "Cada um contribua segundo tiver proposto no coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria."
            </p>
            <p className="text-base text-red-600 font-semibold">- 2 Coríntios 9:7</p>
          </div>
        </div>
      </section>

      {/* Horários dos Cultos */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-1">Horários dos Cultos</h2>
            <p className="text-gray-500 text-sm">Venha nos visitar e adorar a Deus conosco</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Terça-feira</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <p>🙏 Consagração <span className="font-semibold text-red-600">09:00</span></p>
                <p>👥 GC <span className="font-semibold text-red-600">19:30</span></p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Quarta-feira</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <p>Quarta Power <span className="font-semibold text-red-600">19:30</span></p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Domingo</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <p>📖 Manhã dos Discípulos <span className="font-semibold text-red-600">08:30</span></p>
                <p>🌟 Culto de Celebração <span className="font-semibold text-red-600">18:00</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .embla { overflow: hidden; }
        .embla__container { display: flex; }
        .embla__slide { flex: 0 0 100%; min-width: 0; }
        @media (min-width: 768px) { .embla__slide { flex: 0 0 50%; } }
        @media (min-width: 1024px) { .embla__slide { flex: 0 0 33.33%; } }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}