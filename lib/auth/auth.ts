import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

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

        try {
          const usuarios = await sql`
            SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ${credentials.email}
          `;
          
          if (usuarios.length === 0) {
            console.log('Usuário não encontrado:', credentials.email);
            return null;
          }
          
          const usuario = usuarios[0];
          const senhaValida = await bcrypt.compare(credentials.senha, usuario.senha);
          
          if (!senhaValida) {
            return null;
          }
          
          console.log('Login autorizado para:', usuario.nome, 'ID:', usuario.id);
          
          return {
            id: usuario.id.toString(),
            email: usuario.email,
            name: usuario.nome,
            tipo: usuario.tipo,
          };
        } catch (error) {
          console.error('Erro no authorize:', error);
          return null;
        }
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
        session.user.tipo = token.tipo as string;
        session.user.id = token.id as string;
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