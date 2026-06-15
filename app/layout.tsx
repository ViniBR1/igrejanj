import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Logo from '@/components/Logo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Igreja Nova Jerusalém',
  description: 'Um lugar de fé, esperança e amor',
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
          <header className="bg-black text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                  <Logo className="w-10 h-10" />
                  <span className="text-xl font-bold tracking-tight hidden sm:inline">Igreja Nova Jerusalém</span>
                </Link>
                
                {/* Menu Desktop */}
                <nav className="hidden md:flex gap-6">
                  <Link href="/" className="hover:text-gray-300 transition">Início</Link>
                  <Link href="/loja" className="hover:text-gray-300 transition">Loja</Link>
                  <Link href="/dizimo" className="hover:text-gray-300 transition">Dízimo</Link>
                  <Link href="/oracao" className="hover:text-gray-300 transition">Oração</Link>
                  <Link href="/estudos" className="hover:text-gray-300 transition">Estudos</Link>
                  <Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Área Restrita
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
          <footer className="bg-black text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <Logo className="w-8 h-8" />
                <span className="text-gray-400">© 2024 Igreja Nova Jerusalém - Todos os direitos reservados</span>
              </div>
            </div>
          </footer>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}