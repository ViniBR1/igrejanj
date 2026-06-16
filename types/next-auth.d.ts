import 'next-auth';

declare module 'next-auth' {
  interface User {
    tipo?: string;
    id?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      tipo?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tipo?: string;
    id?: string;
  }
}