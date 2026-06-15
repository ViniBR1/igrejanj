'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, ShoppingBag, CreditCard, Plus, Minus, User, Phone, Mail, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CarrinhoItem {
  id: number;
  nome: string;
  preco: number;
  tamanho: string;
  quantidade: number;
  imagem: string;
}

export default function CarrinhoPage() {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = () => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      setCarrinho(JSON.parse(saved));
    }
  };

  const atualizarQuantidade = (id: number, tamanho: string, delta: number) => {
    const novoCarrinho = carrinho.map(item => {
      if (item.id === id && item.tamanho === tamanho) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    });
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
  };

  const removerItem = (id: number, tamanho: string) => {
    const novoCarrinho = carrinho.filter(item => !(item.id === id && item.tamanho === tamanho));
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
    toast.success('Item removido');
  };

  const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const validarCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    return true;
  };

  const validarTelefone = (telefone: string) => {
    telefone = telefone.replace(/[^\d]/g, '');
    return telefone.length >= 10 && telefone.length <= 11;
  };

  const prosseguirPagamento = () => {
    if (!cliente.nome) {
      toast.error('Digite seu nome completo');
      return;
    }
    if (!validarCPF(cliente.cpf)) {
      toast.error('CPF inválido');
      return;
    }
    if (!validarTelefone(cliente.telefone)) {
      toast.error('Telefone inválido (com DDD)');
      return;
    }
    finalizarCompra();
  };

  const finalizarCompra = async () => {
    if (carrinho.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setLoading(true);
    
    const items = carrinho.map(item => ({
      title: `${item.nome} - Tamanho: ${item.tamanho}`,
      quantity: item.quantidade,
      unit_price: item.preco,
      currency_id: 'BRL',
      tamanho: item.tamanho
    }));

    try {
      const response = await fetch('/api/mercadopago/create-preference-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total, cliente })
      });

      const data = await response.json();
      
      if (data.initPoint) {
        localStorage.setItem('pedido_pendente', JSON.stringify({ items: carrinho, total, cliente }));
        window.location.href = data.initPoint;
      } else {
        toast.error('Erro ao iniciar pagamento');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (carrinho.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-6">Que tal conhecer nossos produtos?</p>
          <Link href="/loja">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700">
              Continuar Comprando
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <Link href="/loja">
          <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para loja
          </button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meu Carrinho</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lista de itens */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y">
                {carrinho.map((item, index) => (
                  <div key={`${item.id}-${item.tamanho}`} className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">Tamanho: {item.tamanho}</p>
                      <p className="text-purple-600 font-bold mt-1">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <button onClick={() => atualizarQuantidade(item.id, item.tamanho, -1)} className="px-2 py-1 hover:bg-gray-100">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantidade}</span>
                        <button onClick={() => atualizarQuantidade(item.id, item.tamanho, 1)} className="px-2 py-1 hover:bg-gray-100">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removerItem(item.id, item.tamanho)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo e Formulário */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              
              {/* Formulário do Cliente */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={cliente.cpf}
                      onChange={(e) => setCliente({...cliente, cpf: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={cliente.telefone}
                      onChange={(e) => setCliente({...cliente, telefone: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) => setCliente({...cliente, email: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span>A confirmar</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={prosseguirPagamento}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold mt-4 hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processando...' : 'Finalizar Compra'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Pagamento seguro via Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}