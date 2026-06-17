import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 🔥 FORÇA ROTA DINÂMICA - NUNCA gerar estaticamente
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    console.log('Buscando colaborador por email:', email);
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    
    const colaborador = await sql`
      SELECT 
        c.id, 
        c.usuario_id, 
        c.funcao, 
        c.nivel, 
        c.ativo,
        c.data_entrada,
        a.id as area_id,
        a.nome as area_nome, 
        a.tipo as area_tipo,
        u.id as usuario_id,
        u.nome,
        u.email,
        u.telefone
      FROM colaboradores c
      JOIN usuarios u ON c.usuario_id = u.id
      JOIN areas a ON c.area_id = a.id
      WHERE u.email = ${email} AND c.ativo = true
    `;
    
    console.log('Colaborador encontrado:', colaborador.length > 0);
    
    if (colaborador.length === 0) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(colaborador[0]);
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    return NextResponse.json({ error: 'Erro ao buscar colaborador' }, { status: 500 });
  }
}