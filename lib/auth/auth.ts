import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// USUÁRIOS FIXOS
const usuariosFixos = [
  {
    id: "1",
    nome: "Pastor Antonio",
    email: "pastor@nj.com",
    senha: "123456",
    tipo: "admin",
  },
  {
    id: "2",
    nome: "Carlos",
    email: "carlos@nj.com",
    senha: "123456",
    tipo: "colaborador",
  },
  {
    id: "3",
    nome: "Maria",
    email: "maria@nj.com",
    senha: "123456",
    tipo: "colaborador",
  },
  {
    id: "4",
    nome: "João",
    email: "joao@nj.com",
    senha: "123456",
    tipo: "colaborador",
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        const usuario = usuariosFixos.find(
          u => u.email === credentials.email && u.senha === credentials.senha
        );

        if (!usuario) {
          return null;
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          tipo: usuario.tipo,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tipo = user.tipo;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.tipo = token.tipo;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};