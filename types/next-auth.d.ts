import 'next-auth';

declare module 'next-auth' {
  interface User {
    tipo?: string;
    area?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      tipo?: string;
      area?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tipo?: string;
    area?: string;
    id?: string;
  }
}