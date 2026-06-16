import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    console.log('Buscar simples - email:', email);
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    
    // Buscar usuário
    const usuario = await sql`
      SELECT id, nome, email FROM usuarios WHERE email = ${email}
    `;
    
    console.log('Usuário encontrado:', usuario.length > 0);
    
    if (usuario.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Buscar colaborador - PRIORIZAR funcao da tabela colaboradores
    const colaborador = await sql`
      SELECT 
        c.*,
        COALESCE(c.funcao, 'Músico') as instrumento
      FROM colaboradores c
      WHERE c.usuario_id = ${usuario[0].id} AND c.ativo = true
    `;
    
    console.log('Colaborador encontrado:', colaborador.length > 0);
    console.log('Função do colaborador:', colaborador[0]?.funcao);
    
    if (colaborador.length === 0) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
    }
    
    // Buscar área
    const area = await sql`
      SELECT * FROM areas WHERE id = ${colaborador[0].area_id}
    `;
    
    const resultado = {
      ...colaborador[0],
      nome: usuario[0].nome,
      email: usuario[0].email,
      area_nome: area[0]?.nome || 'Área não definida',
      area_tipo: area[0]?.tipo || '',
      instrumento: colaborador[0].funcao || 'Músico'
    };
    
    console.log('Resultado final - instrumento:', resultado.instrumento);
    
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: 'Erro ao buscar colaborador' }, { status: 500 });
  }
}