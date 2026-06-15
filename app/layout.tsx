import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Church, ShoppingBag } from 'lucide-react';

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
          <header className="bg-purple-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                  <Church className="w-8 h-8" />
                  <span className="text-xl font-bold">Igreja Nova Jerusalém</span>
                </Link>
                <nav className="hidden md:flex gap-6">
                  <Link href="/" className="hover:text-yellow-300 transition">Início</Link>
                  <Link href="/eventos" className="hover:text-yellow-300 transition">Eventos</Link>
                  <Link href="/loja" className="hover:text-yellow-300 transition flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    Loja
                  </Link>
                  <Link href="/dizimo" className="hover:text-yellow-300 transition">Dízimo</Link>
                  <Link href="/oracao" className="hover:text-yellow-300 transition">Oração</Link>
                  <Link href="/estudos" className="hover:text-yellow-300 transition">Estudos</Link>
                  <Link href="/login" className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Área Restrita
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
          <footer className="bg-purple-900 text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p>© 2026 Igreja Nova Jerusalém - Todos os direitos reservados</p>
            </div>
          </footer>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}