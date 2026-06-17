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
    
    const usuario = await sql`
      SELECT id, nome, email FROM usuarios WHERE email = ${email}
    `;
    
    if (usuario.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    const colaborador = await sql`
      SELECT * FROM colaboradores WHERE usuario_id = ${usuario[0].id} AND ativo = true
    `;
    
    if (colaborador.length === 0) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
    }
    
    const area = await sql`
      SELECT nome FROM areas WHERE id = ${colaborador[0].area_id}
    `;
    
    return NextResponse.json({
      ...colaborador[0],
      nome: usuario[0].nome,
      email: usuario[0].email,
      area_nome: area[0]?.nome || 'Área não definida'
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}