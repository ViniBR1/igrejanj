import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { MapPin, Church, ShoppingBag, Heart, BookOpen, Home, Calendar, Music } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Igreja Nova Jerusalém',
  description: 'Um lugar de fé, esperança e amor',
  keywords: 'igreja, nova jerusalém, fé, amor, esperança, culto, louvor',
  authors: [{ name: 'Igreja Nova Jerusalém' }],
  openGraph: {
    title: 'Igreja Nova Jerusalém',
    description: 'Um lugar de fé, esperança e amor',
    url: 'https://igrejanj.vercel.app',
    siteName: 'Igreja Nova Jerusalém',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {/* Header Moderno */}
          <header className="bg-black text-white shadow-xl sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <Logo className="w-12 h-12" />
                    <div className="absolute -inset-1 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition duration-500"></div>
                  </div>
                  <div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Igreja Nova Jerusalém
                    </span>
                    <span className="hidden lg:block text-xs text-gray-400 font-light tracking-wider">
                      🌟 Uma igreja que ama, acolhe e transforma
                    </span>
                  </div>
                </Link>

                {/* Menu Desktop */}
                <nav className="hidden xl:flex items-center gap-1">
                  <Link href="/" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <Home className="w-4 h-4" /> Início
                  </Link>
                  <Link href="/loja" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <ShoppingBag className="w-4 h-4" /> Loja
                  </Link>
                  <Link href="/dizimo" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <Heart className="w-4 h-4" /> Dízimo
                  </Link>
                  <Link href="/oracao" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="w-4 h-4" /> Oração
                  </Link>
                  <Link href="/estudos" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="w-4 h-4" /> Estudos
                  </Link>
                  <Link href="/eventos" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4" /> Eventos
                  </Link>
                  <Link href="/localizacao" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4" /> Localização
                  </Link>
                </nav>

                {/* Área Restrita e Menu Mobile */}
                <div className="flex items-center gap-3">
                  <Link href="/login" className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl text-sm">
                    Área Restrita
                  </Link>
                  
                  {/* Menu Mobile Button */}
                  <button className="xl:hidden p-2 hover:bg-white/10 rounded-lg transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Menu Mobile (opcional - será implementado depois) */}
              <div className="xl:hidden hidden" id="mobile-menu">
                <div className="py-4 space-y-2 border-t border-gray-800">
                  <Link href="/" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Início</Link>
                  <Link href="/loja" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Loja</Link>
                  <Link href="/dizimo" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Dízimo</Link>
                  <Link href="/oracao" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Oração</Link>
                  <Link href="/estudos" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Estudos</Link>
                  <Link href="/eventos" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Eventos</Link>
                  <Link href="/localizacao" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">Localização</Link>
                </div>
              </div>
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="min-h-screen bg-gray-50">{children}</main>

          {/* Footer Moderno */}
          <footer className="bg-black text-white border-t border-gray-800">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Coluna 1: Logo e Descrição */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Logo className="w-10 h-10" />
                    <span className="text-xl font-bold">Igreja Nova Jerusalém</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Uma igreja que ama, acolhe e transforma vidas através do amor de Cristo desde 1990.
                  </p>
                  <div className="flex gap-4 pt-2">
                    <a href="#" className="text-gray-400 hover:text-white transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  </div>
                </div>

                {/* Coluna 2: Links Rápidos */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li><Link href="/" className="hover:text-white transition">Início</Link></li>
                    <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                    <li><Link href="/estudos" className="hover:text-white transition">Estudos Bíblicos</Link></li>
                    <li><Link href="/dizimo" className="hover:text-white transition">Dízimo e Ofertas</Link></li>
                    <li><Link href="/oracao" className="hover:text-white transition">Pedidos de Oração</Link></li>
                  </ul>
                </div>

                {/* Coluna 3: Ministérios */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ministérios</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li><Link href="/colaborador/louvor" className="hover:text-white transition">🎵 Louvor</Link></li>
                    <li><Link href="/kids" className="hover:text-white transition">👧 Kids</Link></li>
                    <li><Link href="/diaconia" className="hover:text-white transition">🤝 Diaconia</Link></li>
                    <li><Link href="/midia" className="hover:text-white transition">📹 Mídia</Link></li>
                    <li><Link href="/acolhida" className="hover:text-white transition">👋 Acolhida</Link></li>
                  </ul>
                </div>

                {/* Coluna 4: Contato e Localização */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contato</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <Link href="/localizacao" className="hover:text-white transition">
                        Av. Abílio Augusto Távora, 532
                        <br className="hidden sm:inline" />
                        <span className="text-sm">Nova Iguaçu - RJ</span>
                      </Link>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      <span>(21) 98534-5627</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      <span>contato@igrejanovajerusalem.com</span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Link href="/localizacao">
                      <button className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        Como Chegar
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  © 2026 Igreja Nova Jerusalém - Todos os direitos reservados
                  <span className="hidden sm:inline mx-2">•</span>
                  <span className="text-xs text-gray-500">Feito com 🙏 para honra e glória de Deus</span>
                </p>
              </div>
            </div>
          </footer>

          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}