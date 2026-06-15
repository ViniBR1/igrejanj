'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, Heart, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DizimoPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    valor: '',
    tipo: 'dizimo',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nome || !form.valor) {
      toast.error('Preencha seu nome e o valor');
      return;
    }

    if (parseFloat(form.valor) < 1) {
      toast.error('O valor mínimo é R$ 1,00');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          valor: form.valor,
          tipo: form.tipo,
          mensagem: form.mensagem
        })
      });

      const data = await response.json();

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        toast.error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Obrigado pela contribuição!</h1>
            <p className="text-gray-600 mb-6">Deus abençoe sua vida abundantemente!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSucesso(false)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Nova contribuição
              </button>
              <Link href="/">
                <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50">
                  Voltar ao início
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Botão voltar */}
        <Link href="/">
          <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dízimo e Ofertas</h1>
          <p className="text-gray-600 mt-2">
            Contribua para a obra de Deus com alegria e gratidão
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Tipo de contribuição */}
          <div className="grid grid-cols-2 border-b">
            <button
              onClick={() => setForm({ ...form, tipo: 'dizimo' })}
              className={`py-4 text-center font-semibold transition ${
                form.tipo === 'dizimo' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🙏 Dízimo
            </button>
            <button
              onClick={() => setForm({ ...form, tipo: 'oferta' })}
              className={`py-4 text-center font-semibold transition ${
                form.tipo === 'oferta' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎁 Oferta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu nome completo *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                placeholder="Digite seu nome"
                required
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 text-2xl border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            {/* Sugestões de valores */}
            <div className="flex flex-wrap gap-2">
              {[10, 20, 50, 100, 200].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, valor: v.toString() })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  R$ {v}
                </button>
              ))}
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem (opcional)
              </label>
              <textarea
                rows={3}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
                placeholder="Deixe uma mensagem para a igreja..."
              />
            </div>

            {/* Versículo */}
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-purple-800 text-sm italic">
                "Cada um contribua segundo tiver proposto no coração, não com tristeza ou por necessidade; 
                porque Deus ama ao que dá com alegria." - 2 Coríntios 9:7
              </p>
            </div>

            {/* Botão de envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Contribuir R$ {form.valor || '0'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}