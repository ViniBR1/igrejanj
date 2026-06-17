import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { MapPin, Home, ShoppingBag, Heart, BookOpen, Calendar, Play } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://igrejanj.vercel.app'),
  title: 'Igreja Nova Jerusalém',
  description: 'Um lugar de fé, esperança e amor',
  keywords: 'igreja, nova jerusalém, fé, amor, esperança, culto',
  authors: [{ name: 'Igreja Nova Jerusalém' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* Header Preto */}
          <header className="bg-black text-white shadow-xl sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16 md:h-20">
                <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                  <Logo className="w-10 h-10 md:w-12 md:h-12" />
                  <div className="hidden sm:block">
                    <span className="text-base md:text-xl font-bold tracking-tight text-black">
                      Igreja Nova Jerusalém
                    </span>
                    <span className="hidden lg:block text-[10px] text-gray-400 font-light tracking-wider">
                      🌟 Uma igreja que ama, acolhe e transforma
                    </span>
                  </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                  <Link href="/" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-black">Início</Link>
                  <Link href="/ao-vivo" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-red-600">Ao Vivo</Link>
                  <Link href="/loja" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-black">Loja</Link>
                  <Link href="/dizimo" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-black">Dízimo</Link>
                  <Link href="/oracao" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-black">Oração</Link>
                </nav>

                <div className="flex items-center gap-2 md:gap-3">
                  <Link href="/login" className="bg-black text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition text-xs md:text-sm border border-gray-300">
                    Área Restrita
                  </Link>
                  <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-screen">{children}</main>

          {/* Footer Preto com nome preto */}
          <footer className="bg-white text-black border-t border-gray-200">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Logo className="w-10 h-10" />
                    <span className="text-lg font-bold text-black">Igreja Nova Jerusalém</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Uma igreja que ama, acolhe e transforma vidas através do amor de Cristo desde 1990.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <a href="#" className="text-gray-400 hover:text-black transition"><i className="fa-brands fa-instagram text-xl"></i></a>
                    <a href="#" className="text-gray-400 hover:text-black transition"><i className="fa-brands fa-youtube text-xl"></i></a>
                    <a href="#" className="text-gray-400 hover:text-black transition"><i className="fa-brands fa-facebook text-xl"></i></a>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3 text-black">Links Rápidos</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li><Link href="/" className="hover:text-black transition">Início</Link></li>
                    <li><Link href="/ao-vivo" className="hover:text-black transition">Ao Vivo</Link></li>
                    <li><Link href="/eventos" className="hover:text-black transition">Eventos</Link></li>
                    <li><Link href="/estudos" className="hover:text-black transition">Estudos</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3 text-black">Ministérios</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li><Link href="/colaborador/louvor" className="hover:text-black transition">🎵 Louvor</Link></li>
                    <li><Link href="/kids" className="hover:text-black transition">👧 Kids</Link></li>
                    <li><Link href="/diaconia" className="hover:text-black transition">🤝 Diaconia</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3 text-black">Contato</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <Link href="/localizacao" className="hover:text-black transition">
                        Av. Abílio Augusto Távora, 532
                        <br className="hidden sm:inline" />
                        <span className="text-sm">Nova Iguaçu - RJ</span>
                      </Link>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-phone"></i> (21) 98534-5627
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-envelope"></i> contato@igrejanovajerusalem.com
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 md:mt-8 pt-6 text-center">
                <p className="text-gray-500 text-xs md:text-sm">
                  © 2026 Igreja Nova Jerusalém - Todos os direitos reservados
                </p>
              </div>
            </div>
          </footer>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' },
              success: { duration: 3000, iconTheme: { primary: '#DC2626', secondary: '#fff' } },
              error: { duration: 4000, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}