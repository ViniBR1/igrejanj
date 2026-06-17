import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Buscando colaborador para userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
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
        u.nome,
        u.email,
        u.telefone
      FROM colaboradores c
      JOIN usuarios u ON c.usuario_id = u.id
      JOIN areas a ON c.area_id = a.id
      WHERE c.usuario_id = ${userId} AND c.ativo = true
    `;
    
    console.log('Colaborador encontrado:', colaborador.length > 0);
    
    if (colaborador.length === 0) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(colaborador[0]);
  } catch (error) {
    console.error('Erro ao buscar colaborador por usuário:', error);
    return NextResponse.json({ error: 'Erro ao buscar colaborador' }, { status: 500 });
  }
}