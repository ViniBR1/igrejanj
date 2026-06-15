'use client';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PagamentoPendente() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Pagamento Pendente
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Seu pagamento está sendo processado. Em breve você receberá a confirmação.
          </p>
          <Link href="/">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700">
              Voltar para Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}