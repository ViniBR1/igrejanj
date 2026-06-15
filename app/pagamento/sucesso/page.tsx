'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Heart } from 'lucide-react';

export default function PagamentoSucesso() {
  useEffect(() => {
    // Salvar no localStorage que o pagamento foi aprovado
    localStorage.setItem('ultimo_pagamento', 'sucesso');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Sua contribuição foi recebida com sucesso. Deus abençoe sua vida!
          </p>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-purple-800">
              "Deus ama ao que dá com alegria" - 2 Coríntios 9:7
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700">
                Voltar para Home
              </button>
            </Link>
            <Link href="/dizimo">
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50">
                Fazer nova contribuição
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}