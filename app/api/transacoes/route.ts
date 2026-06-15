import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Buscar todas as transações
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const status = searchParams.get('status');
    
    let query = sql`
      SELECT * FROM transacoes 
      ORDER BY criado_em DESC
    `;
    
    const transacoes = await query;
    
    return NextResponse.json(transacoes);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json([], { status: 500 });
  }
}