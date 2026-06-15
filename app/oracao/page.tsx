'use client';
import { useState } from 'react';
import { Heart, Send, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OracaoPage() {
  const [form, setForm] = useState({
    nome: '',
    motivo: '',
    contato: ''
  });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nome || !form.motivo) {
      toast.error('Preencha seu nome e o motivo da oração');
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch('/api/oracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        toast.success('Pedido enviado! 🙏 Estamos orando por você');
        setForm({ nome: '', motivo: '', contato: '' });
      } else {
        toast.error('Erro ao enviar pedido. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 mx-auto text-pink-500" />
            <h1 className="text-3xl font-bold mt-4">Pedido de Oração</h1>
            <p className="text-gray-600 mt-2">
              Compartilhe sua necessidade. Estamos aqui para orar por você.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da oração *
              </label>
              <textarea
                rows={5}
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Compartilhe o que você gostaria de pedir em oração..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contato (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Telefone ou email para retorno"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
            >
              {enviando ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Pedido de Oração
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-purple-800 italic">
              "Não andeis ansiosos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus."
            </p>
            <p className="text-purple-600 mt-2">- Filipenses 4:6</p>
          </div>
        </div>
      </div>
    </div>
  );
}