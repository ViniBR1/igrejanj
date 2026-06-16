'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Church, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn('credentials', {
      email,
      senha,
      redirect: false,
    });
    
    if (result?.error) {
      toast.error('Email ou senha inválidos');
      setLoading(false);
    } else {
      toast.success('Login realizado!');
      
      // Buscar tipo do usuário
      const res = await fetch(`/api/usuarios/check-tipo?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      console.log('Tipo do usuário:', data);
      
      // Redirecionar baseado no tipo
      if (data.tipo === 'admin') {
        window.location.href = '/admin';
      } else if (data.tipo === 'colaborador') {
        window.location.href = '/colaborador';
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Church className="w-10 h-10 text-gray-800" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Área Restrita</h2>
          <p className="text-gray-500 mt-2">Acesso para colaboradores, pastores e administradores</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800" 
                placeholder="seu@email.com" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800" 
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Contato: contato@igrejanovajerusalem.com</p>
        </div>
      </div>
    </div>
  );
}