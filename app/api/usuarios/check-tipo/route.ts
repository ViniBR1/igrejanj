import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    
    const usuarios = await sql`
      SELECT tipo FROM usuarios WHERE email = ${email}
    `;
    
    if (usuarios.length === 0) {
      return NextResponse.json({ tipo: null });
    }
    
    return NextResponse.json({ tipo: usuarios[0].tipo });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ tipo: null }, { status: 500 });
  }
}