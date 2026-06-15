'use client';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutErro() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Pagamento não concluído
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Houve um problema com seu pagamento. Por favor, tente novamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/carrinho">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700">
                Voltar para o Carrinho
              </button>
            </Link>
            <Link href="/loja">
              <button className="border-2 border-gray-300 text-gray-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Continuar Comprando
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}